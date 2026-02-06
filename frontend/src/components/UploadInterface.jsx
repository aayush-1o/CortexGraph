import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Button, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { uploadDocument } from '../services/api';
import './UploadInterface.css';

const UploadInterface = ({ onUploadSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const onDrop = async (acceptedFiles) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await uploadDocument(file);
            setResult(response);
            if (onUploadSuccess) {
                onUploadSuccess(response);
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Upload failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/plain': ['.txt'],
            'application/json': ['.json'],
        },
        maxSize: 10 * 1024 * 1024, // 10 MB
        multiple: false,
    });

    return (
        <Box className="upload-container">
            <Paper
                {...getRootProps()}
                className={`dropzone ${isDragActive ? 'active' : ''} ${loading ? 'loading' : ''}`}
                elevation={3}
            >
                <input {...getInputProps()} />
                {loading ? (
                    <Box className="upload-loading">
                        <CircularProgress size={60} />
                        <Typography variant="h6" sx={{ mt: 2 }}>
                            Processing document...
                        </Typography>
                    </Box>
                ) : (
                    <Box className="upload-prompt">
                        <CloudUploadIcon sx={{ fontSize: 80, color: '#667eea', mb: 2 }} />
                        <Typography variant="h5" gutterBottom>
                            {isDragActive ? 'Drop the file here' : 'Drag & drop a document'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            or click to browse
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Supported: PDF, DOCX, TXT, JSON (Max 10 MB)
                        </Typography>
                    </Box>
                )}
            </Paper>

            {result && (
                <Alert severity="success" sx={{ mt: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Document processed successfully!
                    </Typography>
                    <Typography variant="body2">
                        <strong>File:</strong> {result.filename}<br />
                        <strong>Entities extracted:</strong> {result.entities_extracted}<br />
                        <strong>Relationships found:</strong> {result.relationships_extracted}<br />
                        <strong>Processing time:</strong> {result.processing_time.toFixed(2)}s
                    </Typography>
                </Alert>
            )}

            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            )}
        </Box>
    );
};

export default UploadInterface;
