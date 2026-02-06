import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: `${API_BASE_URL}/api/v1`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Health check
export const checkHealth = async () => {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
};

// Ingestion
export const uploadDocument = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/ingest', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const ingestText = async (text, source = 'user_input') => {
    const response = await api.post('/ingest/text', null, {
        params: { text, source },
    });
    return response.data;
};

// Query
export const semanticQuery = async (query, limit = 10, includeRelationships = true) => {
    const response = await api.post('/query', {
        query,
        limit,
        include_relationships: includeRelationships,
    });
    return response.data;
};

export const simpleSearch = async (text, limit = 10) => {
    const response = await api.get(`/search/${encodeURIComponent(text)}`, {
        params: { limit },
    });
    return response.data;
};

export const getEntity = async (entityId, depth = 1) => {
    const response = await api.get(`/entity/${entityId}`, {
        params: { depth },
    });
    return response.data;
};

// Graph
export const getGraph = async (limit = 100) => {
    const response = await api.get('/graph', {
        params: { limit },
    });
    return response.data;
};

export const getStats = async () => {
    const response = await api.get('/stats');
    return response.data;
};

export const clearGraph = async () => {
    const response = await api.delete('/graph');
    return response.data;
};

export const executeCypher = async (query) => {
    const response = await api.post('/cypher', null, {
        params: { query },
    });
    return response.data;
};

export default api;
