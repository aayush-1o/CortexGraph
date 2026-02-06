import React from 'react';
import {
    Box,
    ToggleButtonGroup,
    ToggleButton,
    Paper,
    Tooltip,
    IconButton,
    Chip,
    FormGroup,
    FormControlLabel,
    Checkbox,
    Typography,
    Divider,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import HubIcon from '@mui/icons-material/Hub';
import GridOnIcon from '@mui/icons-material/GridOn';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import ImageIcon from '@mui/icons-material/Image';
import CodeIcon from '@mui/icons-material/Code';
import DataObjectIcon from '@mui/icons-material/DataObject';
import './GraphControls.css';

const GraphControls = ({
    layout,
    onLayoutChange,
    entityTypes,
    selectedTypes,
    onFilterChange,
    isFullscreen,
    onToggleFullscreen,
    onExport
}) => {
    const [showFilters, setShowFilters] = React.useState(false);
    const [exportAnchor, setExportAnchor] = React.useState(null);

    const handleExportClick = (event) => {
        setExportAnchor(event.currentTarget);
    };

    const handleExportClose = () => {
        setExportAnchor(null);
    };

    const handleExport = (format) => {
        onExport(format);
        handleExportClose();
    };

    const layoutOptions = [
        { value: 'force', icon: <BubbleChartIcon />, label: 'Force-Directed' },
        { value: 'hierarchical', icon: <AccountTreeIcon />, label: 'Hierarchical' },
        { value: 'circular', icon: <HubIcon />, label: 'Circular' },
        { value: 'grid', icon: <GridOnIcon />, label: 'Grid' },
    ];

    return (
        <Box className="graph-controls">
            <Paper elevation={2} sx={{ p: 1.5, borderRadius: 2, background: 'rgba(255,255,255,0.95)' }}>
                {/* Layout Selector */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#666' }}>
                        Layout:
                    </Typography>
                    <ToggleButtonGroup
                        value={layout}
                        exclusive
                        onChange={(e, value) => value && onLayoutChange(value)}
                        size="small"
                        aria-label="graph layout"
                    >
                        {layoutOptions.map(option => (
                            <ToggleButton key={option.value} value={option.value}>
                                <Tooltip title={option.label}>
                                    {option.icon}
                                </Tooltip>
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>

                    {/* Fullscreen Toggle */}
                    <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
                        <IconButton
                            onClick={onToggleFullscreen}
                            size="small"
                            sx={{ ml: 'auto' }}
                        >
                            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                        </IconButton>
                    </Tooltip>

                    {/* Filter Toggle */}
                    <Tooltip title="Filter Nodes">
                        <IconButton
                            onClick={() => setShowFilters(!showFilters)}
                            size="small"
                            color={showFilters ? 'primary' : 'default'}
                        >
                            <FilterListIcon />
                        </IconButton>
                    </Tooltip>

                    {/* Export Button */}
                    <Tooltip title="Export Graph">
                        <IconButton
                            onClick={handleExportClick}
                            size="small"
                        >
                            <DownloadIcon />
                        </IconButton>
                    </Tooltip>

                    {/* Export Menu */}
                    <Menu
                        anchorEl={exportAnchor}
                        open={Boolean(exportAnchor)}
                        onClose={handleExportClose}
                    >
                        <MenuItem onClick={() => handleExport('png')}>
                            <ListItemIcon><ImageIcon fontSize="small" /></ListItemIcon>
                            <ListItemText>Export as PNG</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={() => handleExport('svg')}>
                            <ListItemIcon><CodeIcon fontSize="small" /></ListItemIcon>
                            <ListItemText>Export as SVG</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={() => handleExport('json')}>
                            <ListItemIcon><DataObjectIcon fontSize="small" /></ListItemIcon>
                            <ListItemText>Export as JSON</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={() => handleExport('graphml')}>
                            <ListItemIcon><AccountTreeIcon fontSize="small" /></ListItemIcon>
                            <ListItemText>Export as GraphML</ListItemText>
                        </MenuItem>
                    </Menu>
                </Box>

                {/* Filter Panel */}
                {showFilters && (
                    <>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: '#666', mb: 1, display: 'block' }}>
                                Entity Types:
                            </Typography>
                            <FormGroup>
                                {entityTypes.map(type => {
                                    const count = type.count || 0;
                                    return (
                                        <FormControlLabel
                                            key={type.name}
                                            control={
                                                <Checkbox
                                                    checked={selectedTypes.includes(type.name)}
                                                    onChange={(e) => onFilterChange(type.name, e.target.checked)}
                                                    size="small"
                                                />
                                            }
                                            label={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <span style={{ color: type.color }}>{type.name}</span>
                                                    <Chip label={count} size="small" sx={{ height: 18, fontSize: '0.7rem' }} />
                                                </Box>
                                            }
                                        />
                                    );
                                })}
                            </FormGroup>
                        </Box>
                    </>
                )}
            </Paper>
        </Box>
    );
};

export default GraphControls;
