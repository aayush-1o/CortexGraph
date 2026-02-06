import React, { useState, useEffect } from 'react';
import {
    Container,
    Box,
    Typography,
    AppBar,
    Toolbar,
    Paper,
    Grid,
    Chip,
    Tabs,
    Tab,
    Alert,
    IconButton,
    Tooltip,
    ThemeProvider,
    CssBaseline,
} from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TimelineIcon from '@mui/icons-material/Timeline';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import GraphVisualization from './components/GraphVisualization';
import UploadInterface from './components/UploadInterface';
import SearchBar from './components/SearchBar';
import { getGraph, getStats, checkHealth } from './services/api';
import { lightTheme, darkTheme } from './theme';
import './App.css';

function App() {
    const [graphData, setGraphData] = useState(null);
    const [stats, setStats] = useState({ nodes: 0, edges: 0 });
    const [activeTab, setActiveTab] = useState(0);
    const [health, setHealth] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('cortexgraph_theme');
        return saved === 'dark';
    });

    const theme = darkMode ? darkTheme : lightTheme;

    const toggleDarkMode = () => {
        setDarkMode(prev => {
            const newMode = !prev;
            localStorage.setItem('cortexgraph_theme', newMode ? 'dark' : 'light');
            return newMode;
        });
    };

    // Load graph data
    const loadGraph = async () => {
        try {
            const data = await getGraph(200);
            setGraphData(data);
        } catch (error) {
            console.error('Error loading graph:', error);
        }
    };

    // Load stats
    const loadStats = async () => {
        try {
            const statsData = await getStats();
            setStats(statsData);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    // Check health
    const loadHealth = async () => {
        try {
            const healthData = await checkHealth();
            setHealth(healthData);
        } catch (error) {
            console.error('Error checking health:', error);
        }
    };

    useEffect(() => {
        loadHealth();
        loadGraph();
        loadStats();
    }, []);

    const handleUploadSuccess = () => {
        loadGraph();
        loadStats();
    };

    const handleSearchResults = (results) => {
        if (results && results.graph_data) {
            setGraphData(results.graph_data);
        } else {
            loadGraph();
        }
    };

    const handleNodeClick = (node) => {
        setSelectedNode(node);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <div className="App">
                {/* Header */}
                <AppBar position="static" className="app-header">
                    <Toolbar>
                        <AccountTreeIcon sx={{ fontSize: 40, mr: 2 }} />
                        <Typography variant="h4" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
                            CortexGraph
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Chip
                                icon={<TimelineIcon />}
                                label={`${stats.nodes} Nodes`}
                                color="primary"
                                variant="outlined"
                            />
                            <Chip
                                icon={<TimelineIcon />}
                                label={`${stats.edges} Edges`}
                                color="secondary"
                                variant="outlined"
                            />
                            {health && (
                                <Chip
                                    label={health.status}
                                    color={health.status === 'healthy' ? 'success' : 'warning'}
                                    size="small"
                                />
                            )}
                            <Tooltip title={darkMode ? 'Light Mode' : 'Dark Mode'}>
                                <IconButton onClick={toggleDarkMode} color="inherit">
                                    {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Toolbar>
                </AppBar>

                <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                    {/* System Status */}
                    {health && health.status !== 'healthy' && (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            System status: {health.status}.
                            {!health.neo4j_connected && ' Neo4j not connected.'}
                            {!health.nlp_loaded && ' NLP engine not loaded.'}
                        </Alert>
                    )}

                    {/* Search Bar */}
                    <SearchBar onSearchResults={handleSearchResults} />

                    {/* Main Content */}
                    <Grid container spacing={3}>
                        {/* Left Panel - Upload & Controls */}
                        <Grid item xs={12} lg={4}>
                            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
                                <Tabs
                                    value={activeTab}
                                    onChange={(e, v) => setActiveTab(v)}
                                    variant="fullWidth"
                                    sx={{ mb: 2 }}
                                >
                                    <Tab label="Upload" />
                                    <Tab label="Info" />
                                </Tabs>

                                {activeTab === 0 && (
                                    <UploadInterface onUploadSuccess={handleUploadSuccess} />
                                )}

                                {activeTab === 1 && (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="h6" gutterBottom>
                                            About CortexGraph
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" paragraph>
                                            CortexGraph is an AI-driven knowledge graph platform that:
                                        </Typography>
                                        <ul style={{ paddingLeft: 20, color: '#666' }}>
                                            <li>Extracts entities from text using NLP</li>
                                            <li>Discovers relationships automatically</li>
                                            <li>Stores data in a graph database</li>
                                            <li>Enables semantic search</li>
                                            <li>Visualizes connections interactively</li>
                                        </ul>

                                        {selectedNode && (
                                            <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                                                <Typography variant="subtitle2" gutterBottom>
                                                    Selected Node
                                                </Typography>
                                                <Typography variant="body2">
                                                    <strong>Text:</strong> {selectedNode.text || selectedNode.id}
                                                </Typography>
                                                <Typography variant="body2">
                                                    <strong>Type:</strong> {selectedNode.label || 'Unknown'}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                )}
                            </Paper>
                        </Grid>

                        {/* Right Panel - Graph Visualization */}
                        <Grid item xs={12} lg={8}>
                            <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', height: 700 }}>
                                <GraphVisualization data={graphData} onNodeClick={handleNodeClick} />
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
            </div>
        </ThemeProvider>
    );
}

export default App;
