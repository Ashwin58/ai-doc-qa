# backend/main.py
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.core import Settings
from typing import Optional
from pathlib import Path
import os
import shutil

# Llama Index imports
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, StorageContext, load_index_from_storage
from llama_index.llms.gemini import Gemini # Import Gemini LLM from Llama Index
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# --- Configuration ---
# Set your Google API key from environment variable
# Make sure GOOGLE_API_KEY is in your .env file
os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")

# Directory to store uploaded documents temporarily and Llama Index storage
UPLOAD_DIR = Path("uploaded_docs")
UPLOAD_DIR.mkdir(exist_ok=True)
INDEX_DIR = Path("llama_index_storage")
INDEX_DIR.mkdir(exist_ok=True)

app = FastAPI(
    title="AI-Powered Document Q&A Backend",
    description="Backend for document upload, indexing, and Q&A with Google Gemini.",
    version="1.0.0",
)

# --- CORS Middleware ---
# This allows your React frontend (e.g., on localhost:3000) to communicate with this backend.
origins = [
    "http://localhost:3000", # Default React development server port
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Global variable to store the current Llama Index ---
# For a single-document Q&A, we'll maintain one active index.
# For multi-document support (future enhancement), this would be a more complex structure.
current_index: Optional[VectorStoreIndex] = None

# --- Helper function to load or create Llama Index ---
def get_or_create_index(document_path: Path):
    global current_index

    # Define LLM and embedding model that will be used.
    # It's good practice to set these once as global settings for Llama Index.
    llm = Gemini(model="gemini-1.5-flash", temperature=0.1)
    embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-small-en-v1.5")

    # Set these as the default models for Llama Index operations
    Settings.llm = llm
    Settings.embed_model = embed_model

    try:
        # Attempt to load an existing index from storage
        # The loaded index will now use the Settings.llm and Settings.embed_model
        if INDEX_DIR.exists() and any(INDEX_DIR.iterdir()):
            print("Attempting to load index from storage...")
            storage_context = StorageContext.from_defaults(persist_dir=str(INDEX_DIR))
            current_index = load_index_from_storage(storage_context)
            print("Index loaded successfully.")
        else:
            # If no existing index, or it's empty/corrupted, force creation
            raise FileNotFoundError("No existing index found or directory is empty.")
    except Exception as e:
        print(f"Could not load index, creating a new one: {e}")
        print(f"Loading document from: {document_path}")

        # Ensure the document_path actually points to a file, not a directory
        if not document_path.is_file():
            raise ValueError(f"Provided path is not a file: {document_path}")

        documents = SimpleDirectoryReader(input_files=[str(document_path)]).load_data()

        # Create the VectorStoreIndex. Since we set Settings.llm and Settings.embed_model
        # above, we can now simply call from_documents without passing them explicitly.
        current_index = VectorStoreIndex.from_documents(documents)

        current_index.storage_context.persist(persist_dir=str(INDEX_DIR))
        print("Index created and persisted successfully.")
    return current_index
# --- FastAPI Endpoints ---

@app.get("/")
async def health_check():
    """
    Simple health check endpoint to confirm the backend is running.
    """
    return {"message": "AI Document Q&A Backend is running!"}

# This is the modified upload_document function, specifically for 'Choose File' only.
@app.post("/upload-document/")
# Removed 'plain_text' parameter. 'file' is now a required File upload.
async def upload_document(file: UploadFile = File(...)):
    """
    Accepts a text file (.txt) upload.
    Saves the content to a temporary file in the 'uploaded_docs' directory.
    """
    uploaded_file_path = None
    try:
        if not file.filename.endswith(".txt"):
            raise HTTPException(status_code=400, detail="Only .txt files are allowed.")

        # Create a safe file path within the UPLOAD_DIR
        uploaded_file_path = UPLOAD_DIR / file.filename
        with open(uploaded_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        return JSONResponse(
            status_code=200,
            content={"message": f"File '{file.filename}' uploaded successfully.", "file_path": str(uploaded_file_path)}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload document: {e}")
@app.post("/index-document/")
async def index_document(file_path: str):
    """
    Indexes the document specified by file_path using Llama Index.
    This will create/update the knowledge base for Q&A.
    """
    global current_index
    document_to_index = Path(file_path)

    if not document_to_index.exists():
        raise HTTPException(status_code=404, detail=f"Document not found at {file_path}. Please upload it first.")

    # Clear existing index storage to ensure a fresh index for the new document.
    # In a multi-document system, you'd manage distinct index directories or a single index for all documents.
    if INDEX_DIR.exists():
        print(f"Clearing existing index storage at {INDEX_DIR}...")
        shutil.rmtree(INDEX_DIR)
        INDEX_DIR.mkdir(exist_ok=True) # Recreate the directory after clearing

    try:
        get_or_create_index(document_to_index)
        return JSONResponse(status_code=200, content={"message": "Document indexed successfully."})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to index document: {e}")

@app.post("/ask-document/")
async def ask_document(question: str):
    """
    Accepts a user question and returns an AI-generated answer
    based on the currently indexed document.
    """
    global current_index
    if current_index is None:
        # Try to load index if it exists but wasn't loaded on startup
        try:
            if INDEX_DIR.exists() and any(INDEX_DIR.iterdir()):
                print("Index not in memory, attempting to load from storage for query...")
                storage_context = StorageContext.from_defaults(persist_dir=str(INDEX_DIR))
                current_index = load_index_from_storage(storage_context)
                print("Index loaded for query.")
            else:
                raise HTTPException(status_code=400, detail="No document indexed. Please upload and index a document first.")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"No document indexed and could not load existing index: {e}. Please upload and index a document first.")


    try:
        # Create a query engine from the index
        query_engine = current_index.as_query_engine()
        response = query_engine.query(question)
        return JSONResponse(status_code=200, content={"answer": str(response)})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate answer: {e}")