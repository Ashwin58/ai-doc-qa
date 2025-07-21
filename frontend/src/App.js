import React, { useState, useEffect } from 'react';
import { Button, Input, message, Card, Space, Typography, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';

const { Title, Paragraph, Text } = Typography;

function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isIndexing, setIsIndexing] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const backendUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : 'YOUR_PRODUCTION_URL';

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch(`${backendUrl}/`);
        if (response.ok) {
          setIsConnected(true);
          message.success('Connected to backend successfully!', 1.5);
        } else {
          message.error('Backend connection failed: Status ' + response.status, 3);
        }
      } catch (error) {
        message.error(`Backend connection failed: ${error.message}`, 3);
      }
    };
    testConnection();
  }, [backendUrl]);

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    message.loading('Uploading file...', 0);

    try {
      const response = await fetch(`${backendUrl}/upload-document/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUploadedFile(data.file_path);
      message.destroy();
      message.success(`File uploaded successfully: ${file.name}`);
      return true;
    } catch (error) {
      message.destroy();
      message.error(`Upload failed: ${error.message}`);
      setUploadedFile(null);
      return false;
    }
  };

  const handleIndexDocument = async () => {
    if (!uploadedFile) {
      message.warning('Please upload a document first.');
      return;
    }
    setIsIndexing(true);
    const hide = message.loading('Indexing document... This might take a moment.', 0);

    try {
      const response = await fetch(`${backendUrl}/index-document/?file_path=${encodeURIComponent(uploadedFile)}`, {
        method: 'POST',
      });

      hide();

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      message.success(data.message || 'Document indexed successfully!');
    } catch (error) {
      console.error('Indexing Error:', error);
      message.error(`Indexing failed: ${error.message}`);
    } finally {
      setIsIndexing(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      message.warning('Please enter a question before asking.');
      return;
    }
    if (!uploadedFile) {
      message.warning('Please upload and index a document first.');
      return;
    }

    setIsAsking(true);
    setAnswer('');
    const hide = message.loading('Asking question... This might take a moment.', 0);

    try {
      const response = await fetch(`${backendUrl}/ask-document/?question=${encodeURIComponent(question.trim())}`, {
        method: 'POST',
      });

      hide();

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAnswer(data.answer);
      message.success('Answer received!');
    } catch (error) {
      console.error('Asking Error:', error);
      message.error(`Question failed: ${error.message}`);
    } finally {
      setIsAsking(false);
    }
  };

  const uploadProps = {
    beforeUpload: async (file) => {
      const isTxt = file.type === 'text/plain' || file.name.endsWith('.txt');
      if (!isTxt) {
        message.error('You can only upload .txt files!');
        return Upload.LIST_IGNORE;
      }
      await handleUpload(file);
      return false;
    },
    onChange: (info) => {
      if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    showUploadList: {
      showRemoveIcon: true,
    },
    maxCount: 1,
    accept: '.txt',
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: 'auto', 
      fontFamily: 'Arial, sans-serif',
      width: '100%',
      boxSizing: 'border-box',
      backgroundColor: '#f0f2f5',
      minHeight: '100vh',
      '@media (max-width: 768px)': {
        padding: '12px'
      }
    }}>
      <Title level={1} style={{ 
        textAlign: 'center', 
        marginBottom: '30px', 
        color: '#1890ff',
        fontSize: 'clamp(1.5rem, 4vw, 2rem)'
      }}>
        Document Q&A with AI
      </Title>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card
          title="1. Upload Document"
          style={{ 
            borderColor: isConnected ? '#52c41a' : '#ff4d4f',
            marginBottom: '16px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            backgroundColor: '#ffffff'
          }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Upload {...uploadProps}>
              <Button 
                icon={<UploadOutlined />} 
                style={{ width: '100%' }}
              >
                Select TXT File
              </Button>
            </Upload>
            {uploadedFile && (
              <Text type="success" style={{ 
                display: 'block', 
                marginTop: '8px',
                wordBreak: 'break-all'
              }}>
                File Ready: {uploadedFile.split('\\').pop().split('/').pop()}
              </Text>
            )}
            <Text type={isConnected ? 'success' : 'danger'}>
              {isConnected ? 'Backend connected' : 'Backend not connected'}
            </Text>
          </Space>
        </Card>

        <Card 
          title="2. Index Document"
          style={{
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            backgroundColor: '#ffffff'
          }}
        >
          <Button
            type="primary"
            onClick={handleIndexDocument}
            loading={isIndexing}
            disabled={!uploadedFile || isIndexing}
            style={{ 
              backgroundColor: '#52c41a', 
              borderColor: '#52c41a',
              width: '100%',
              height: '40px'
            }}
          >
            {isIndexing ? 'Processing...' : 'Index Document'}
          </Button>
        </Card>

        <Card 
          title="3. Ask Your Question"
          style={{
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            backgroundColor: '#ffffff'
          }}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Input.TextArea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to know about the document?"
              autoSize={{ minRows: 3, maxRows: 6 }}
              disabled={isAsking}
              style={{
                fontSize: '16px',
                padding: '12px'
              }}
            />
            <Button
              type="primary"
              onClick={handleAskQuestion}
              loading={isAsking}
              disabled={!question.trim() || isAsking || !uploadedFile}
              style={{
                width: '100%',
                height: '48px',
                fontSize: '16px'
              }}
            >
              Get Answer
            </Button>
          </Space>
        </Card>

        <Card 
          title="AI Response" 
          style={{ 
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            borderLeft: '4px solid #1890ff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <Paragraph style={{ 
            whiteSpace: 'pre-wrap', 
            minHeight: '100px',
            fontSize: '16px',
            lineHeight: '1.6',
            margin: 0
          }}>
            {answer || <Text type="secondary">Your answer will appear here...</Text>}
          </Paragraph>
        </Card>
      </Space>
    </div>
  );
}

export default App;