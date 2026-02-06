import React, { useState } from 'react';
import { Box, TextField, Button, IconButton, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { semanticQuery } from '../services/api';
import './SearchBar.css';

const SearchBar = ({ onSearchResults, onLoading }) => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;

        setLoading(true);
        if (onLoading) onLoading(true);

        try {
            const results = await semanticQuery(query, 20, true);
            if (onSearchResults) {
                onSearchResults(results);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
            if (onLoading) onLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleClear = () => {
        setQuery('');
        if (onSearchResults) {
            onSearchResults(null);
        }
    };

    return (
        <Box className="search-bar-container">
            <TextField
                fullWidth
                variant="outlined"
                placeholder="Ask anything about your data... (e.g., 'Find connections between people and companies')"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon sx={{ color: '#667eea' }} />
                        </InputAdornment>
                    ),
                    endAdornment: query && (
                        <InputAdornment position="end">
                            <IconButton onClick={handleClear} edge="end" size="small">
                                <ClearIcon />
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '50px',
                        background: 'white',
                        '& fieldset': {
                            borderColor: '#ddd',
                        },
                        '&:hover fieldset': {
                            borderColor: '#667eea',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#667eea',
                        },
                    },
                }}
            />
            <Button
                variant="contained"
                onClick={handleSearch}
                disabled={loading || !query.trim()}
                sx={{
                    ml: 2,
                    px: 4,
                    py: 1.5,
                    borderRadius: '50px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    textTransform: 'none',
                    fontSize: '16px',
                    fontWeight: 600,
                    '&:hover': {
                        background: 'linear-gradient(135deg, #5568d3 0%, #6a3f91 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
                    },
                    transition: 'all 0.3s ease',
                }}
            >
                {loading ? 'Searching...' : 'Search'}
            </Button>
        </Box>
    );
};

export default SearchBar;
