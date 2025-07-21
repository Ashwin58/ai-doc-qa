# AI-Powered Document Q&A Application

## Project Overview

This project implements a web-based application that allows users to upload text documents and then ask questions based on the content of those documents. The application is built with a Python FastAPI backend for handling document processing and AI interactions, and a React frontend with Ant Design for a user-friendly interface. It leverages Google's Gemini API for large language model capabilities and a local HuggingFace embedding model for efficient document indexing.

**Key Features:**

* **Document Upload:** Users can upload `.txt` files to the backend.

* **Document Indexing:** The uploaded documents are indexed using a local embedding model (BAAI/bge-small-en-v1.5) and Llama Index, creating a searchable knowledge base.

* **AI-Powered Q&A:** Users can ask natural language questions, and the application uses the Gemini 1.5 Flash model to generate answers based on the indexed document content.

* **Modern UI:** A responsive and interactive user interface built with React and Ant Design.

## Setup and Run Instructions

Follow these steps to set up and run both the backend and frontend components of the application.

### Prerequisites

Before you begin, ensure you have the following installed on your system:

* **Python 3.9+**: For the FastAPI backend.
    * Download: <https://www.python.org/downloads/>

* **Node.js (LTS version) & npm**: For the React frontend.
    * Download: <https://nodejs.org/en>

* **Google API Key for Gemini API**:
    * Obtain from: [Google AI Studio](https://aistudio.google.com/app/apikey) or [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
    * Ensure the "Generative Language API" is enabled for your project.

* **Git (Optional but Recommended)**: For cloning the repository.
    * Download: <https://git-scm.com/downloads>

### 1. Backend Setup

1.  **Navigate to the project root:**
    Open your terminal or Command Prompt and go to the `ai-doc-qa` directory.
    ```bash
    cd D:\document QA\ai-doc-qa
    ```

2.  **Navigate into the backend directory:**
    ```bash
    cd backend
    ```

3.  **Create a Python Virtual Environment (Recommended):**
    ```bash
    python -m venv venv
    ```

4.  **Activate the Virtual Environment:**
    * **Windows:**
        ```bash
        .\venv\Scripts\activate
        ```
    * **macOS/Linux:**
        ```bash
        source venv/bin/activate
        ```

5.  **Install Backend Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
    *(If `requirements.txt` is not present, you might need to install packages manually: `pip install fastapi uvicorn python-dotenv llama-index llama-index-llms-gemini llama-index-embeddings-huggingface`)*

6.  **Create `.env` file:**
    In the `backend` directory, create a file named `.env` and add your Google API Key:
    ```
    GOOGLE_API_KEY="YOUR_GEMINI_API_KEY_HERE"
    ```
    Replace `"YOUR_GEMINI_API_KEY_HERE"` with your actual API key.

7.  **Create `uploaded_docs` directory:**
    Inside the `backend` directory, create a folder named `uploaded_docs`. This is where uploaded files will be stored.
    ```bash
    mkdir uploaded_docs
    ```
    Place a sample `.txt` file (e.g., `a.txt`) inside `uploaded_docs` for initial testing.

8.  **Run the Backend Server:**
    ```bash
    uvicorn main:app --reload
    ```
    The backend server will start, typically running on `http://127.0.0.1:8000`. Keep this terminal window open.

### 2. Frontend Setup

1.  **Open a NEW Terminal/Command Prompt window.**
    * **Do NOT close the backend terminal.**

2.  **Navigate to the frontend directory:**
    ```bash
    cd D:\document QA\ai-doc-qa\frontend
    ```
    *(Remember to use quotes if your path contains spaces: `cd "D:\document QA\ai-doc-qa\frontend"`)*

3.  **Install Frontend Dependencies:**
    ```bash
    npm install
    ```
    This will install React, Ant Design, and other necessary packages.

4.  **Run the Frontend Development Server:**
    ```bash
    npm start
    ```
    This will compile the React application and open it in your default web browser, usually at `http://localhost:3000`. Keep this terminal window open.

### 3. Using the Application

1.  **Access the Frontend:** Open your web browser and go to `http://localhost:3000`.
2.  **Upload Document:**
    * In the "1. Upload Document" section, click "Select TXT File".
    * Choose a `.txt` file from your computer (e.g., the `a.txt` you placed in `backend/uploaded_docs`).
    * The file will be uploaded to the backend. You should see a "File Ready:" message.
3.  **Index Document:**
    * In the "2. Index Document" section, click "Index Document".
    * This will trigger the backend to process and index the uploaded document. You'll see a success message.
4.  **Ask Question:**
    * In the "3. Ask Your Question" section, type a question related to the content of your uploaded document.
    * Click "Get Answer".
    * The AI's response will appear in the "AI Response" section.

## Research Resources

* **FastAPI Documentation:** <https://fastapi.tiangolo.com/>
    * Used for building the robust and efficient API endpoints.
* **React Documentation:** <https://react.dev/>
    * Core library for building the user interface.
* **Ant Design Documentation:** <https://ant.design/docs/react/introduce>
    * Comprehensive UI component library for React, used for consistent and modern design.
* **LlamaIndex Documentation:** <https://docs.llamaindex.ai/en/stable/>
    * Framework for building LLM-powered applications, specifically for data ingestion, indexing, and querying.
* **Google Gemini API Documentation:** <https://ai.google.dev/gemini-api/docs>
    * Reference for integrating with the Gemini large language models.
* **HuggingFace Models (BAAI/bge-small-en-v1.5):** <https://huggingface.co/BAAI/bge-small-en-v1.5>
    * Source for the local embedding model used for document vectorization.

## Design Decisions Summary

### Product-Level Design Document Key Points:

* **User Experience Focus:** Prioritize a clear, intuitive, and efficient workflow for users to interact with documents and AI.
* **Modularity:** Separate backend and frontend for scalability and maintainability.
* **Performance:** Optimize document processing and AI response times.
* **Extensibility:** Design the system to allow for easy integration of different LLMs, embedding models, and document types in the future.
* **Security (Basic):** Ensure basic API key handling and file storage practices.

### Implementation Design Decisions:

1.  **Backend Framework (FastAPI):**
    * **Choice:** FastAPI was chosen for its high performance, asynchronous capabilities, and automatic interactive API documentation (Swagger UI), which greatly aids development and testing.
    * **Data Validation:** FastAPI's Pydantic integration ensures robust data validation for incoming requests, preventing common errors.
    * **Endpoint Design:** Clear, RESTful-like endpoints (`/upload-document/`, `/index-document/`, `/ask-document/`) for distinct operations.

2.  **Frontend Framework (React with Ant Design):**
    * **Choice:** React provides a component-based architecture for building dynamic and reusable UI elements. Ant Design was selected for its comprehensive set of high-quality, enterprise-grade UI components, which accelerate development and ensure a consistent, professional look and feel without extensive custom CSS.
    * **State Management:** React's `useState` and `useEffect` hooks are used for managing component-specific and application-wide state (e.g., loading states, uploaded file path, answers).
    * **API Communication:** `fetch` API is used for making asynchronous HTTP requests to the FastAPI backend.
    * **Theming:** Implemented a "gray and light gray with white letters" theme using Ant Design's `style` props, demonstrating customization capabilities.

3.  **LLM Integration (LlamaIndex):**
    * **Choice:** LlamaIndex was chosen as the orchestration framework for LLM interactions. It simplifies the process of ingesting, indexing, and querying custom data sources with LLMs.
    * **Embedding Model:** `BAAI/bge-small-en-v1.5` (HuggingFaceEmbedding) was selected as a local embedding model. This decision reduces API costs associated with embeddings and ensures privacy for document content during vectorization, as the embeddings are generated locally.
    * **LLM Model:** `gemini-1.5-flash` was chosen for the core Q&A functionality. This model provides a good balance of performance, cost-efficiency, and capability for text generation, suitable for a responsive Q&A application.
    * **Global Configuration:** Using `llama_index.core.Settings` to globally configure the `llm` and `embed_model` ensures consistency across all LlamaIndex operations (indexing and querying).

4.  **Error Handling & User Feedback:**
    * Robust `try-catch` blocks are implemented in both backend and frontend to gracefully handle API errors and network issues.
    * Ant Design's `message` component provides clear, real-time feedback to the user on upload status, indexing progress, and answer retrieval.
    * Loading indicators (`loading` prop on Buttons) provide visual cues during asynchronous operations.

5.  **Data Flow:**
    * **Upload:** Frontend sends file as `FormData` to backend. Backend saves file and returns its path.
    * **Index:** Frontend sends the *path* of the uploaded file as a **query parameter** to the backend. Backend uses this path to load and index the document.
    * **Ask:** Frontend sends the user's question as a **query parameter** to the backend. Backend uses the indexed data and the LLM to generate an answer, which is then sent back to the frontend.
