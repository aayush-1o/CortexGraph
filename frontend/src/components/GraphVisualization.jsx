import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import GraphControls from './GraphControls';
import { exportAsPNG, exportAsSVG, exportAsJSON, exportAsGraphML } from '../utils/exportUtils';
import './GraphVisualization.css';

const GraphVisualization = ({ data, onNodeClick }) => {
    const svgRef = useRef();
    const containerRef = useRef();
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const [layout, setLayout] = useState('force');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [entityTypes, setEntityTypes] = useState([]);

    // Color scale for node types
    const colorScale = d3.scaleOrdinal()
        .domain(['PERSON', 'ORG', 'GPE', 'DATE', 'PRODUCT', 'EVENT', 'WORK_OF_ART', 'LOC', 'MONEY'])
        .range(['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739']);

    // Handle export
    const handleExport = async (format) => {
        try {
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `cortexgraph-${timestamp}`;

            switch (format) {
                case 'png':
                    await exportAsPNG(svgRef.current, filename);
                    break;
                case 'svg':
                    exportAsSVG(svgRef.current, filename);
                    break;
                case 'json':
                    exportAsJSON(data, filename);
                    break;
                case 'graphml':
                    exportAsGraphML(data, filename);
                    break;
                default:
                    console.error('Unknown export format:', format);
            }
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Please try again.');
        }
    };

    // Extract entity types from data
    useEffect(() => {
        if (data && data.nodes) {
            const types = {};
            data.nodes.forEach(node => {
                const type = node.label || 'UNKNOWN';
                types[type] = (types[type] || 0) + 1;
            });

            const typeList = Object.keys(types).map(name => ({
                name,
                count: types[name],
                color: colorScale(name)
            }));

            setEntityTypes(typeList);
            setSelectedTypes(typeList.map(t => t.name));
        }
    }, [data]);

    // Update dimensions
    useEffect(() => {
        const updateDimensions = () => {
            const container = containerRef.current;
            if (container) {
                setDimensions({
                    width: container.clientWidth,
                    height: container.clientHeight || 600,
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, [isFullscreen]);

    // Handle fullscreen toggle
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Handle filter change
    const handleFilterChange = (type, checked) => {
        setSelectedTypes(prev =>
            checked ? [...prev, type] : prev.filter(t => t !== type)
        );
    };

    useEffect(() => {
        if (!data || !data.nodes || data.nodes.length === 0) return;

        const { width, height } = dimensions;

        // Filter nodes based on selected types
        const filteredNodes = data.nodes.filter(node =>
            selectedTypes.includes(node.label || 'UNKNOWN')
        );

        const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
        const filteredEdges = data.edges.filter(edge =>
            filteredNodeIds.has(edge.source.id || edge.source) &&
            filteredNodeIds.has(edge.target.id || edge.target)
        );

        // Clear previous visualization
        d3.select(svgRef.current).selectAll('*').remove();

        // Create SVG
        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height);

        // Create container for zoom
        const g = svg.append('g');

        // Apply layout
        let simulation;
        switch (layout) {
            case 'hierarchical':
                applyHierarchicalLayout(filteredNodes, filteredEdges, width, height);
                break;
            case 'circular':
                applyCircularLayout(filteredNodes, width, height);
                break;
            case 'grid':
                applyGridLayout(filteredNodes, width, height);
                break;
            default: // 'force'
                simulation = createForceLayout(filteredNodes, filteredEdges, width, height);
        }

        // Create arrow markers for directed edges
        svg.append('defs').selectAll('marker')
            .data(['arrow'])
            .enter().append('marker')
            .attr('id', 'arrow')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 20)
            .attr('refY', 0)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('fill', '#999');

        // Create edges
        const link = g.append('g')
            .selectAll('line')
            .data(filteredEdges)
            .enter().append('line')
            .attr('stroke', '#999')
            .attr('stroke-opacity', 0.6)
            .attr('stroke-width', 2)
            .attr('marker-end', 'url(#arrow)')
            .attr('x1', d => d.source.x || 0)
            .attr('y1', d => d.source.y || 0)
            .attr('x2', d => d.target.x || 0)
            .attr('y2', d => d.target.y || 0);

        // Create edge labels
        const edgeLabel = g.append('g')
            .selectAll('text')
            .data(filteredEdges)
            .enter().append('text')
            .attr('font-size', 10)
            .attr('fill', '#666')
            .attr('text-anchor', 'middle')
            .attr('x', d => ((d.source.x || 0) + (d.target.x || 0)) / 2)
            .attr('y', d => ((d.source.y || 0) + (d.target.y || 0)) / 2)
            .text(d => d.type || d.label);

        // Create nodes
        const node = g.append('g')
            .selectAll('circle')
            .data(filteredNodes)
            .enter().append('circle')
            .attr('r', 10)
            .attr('fill', d => colorScale(d.label || 'UNKNOWN'))
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .attr('cx', d => d.x || width / 2)
            .attr('cy', d => d.y || height / 2)
            .style('cursor', 'pointer')
            .on('click', (event, d) => {
                event.stopPropagation();
                if (onNodeClick) onNodeClick(d);
            });

        // Add tooltips
        node.append('title')
            .text(d => `${d.text || d.id}\nType: ${d.label || 'Unknown'}`);

        // Create node labels
        const nodeLabel = g.append('g')
            .selectAll('text')
            .data(filteredNodes)
            .enter().append('text')
            .attr('font-size', 12)
            .attr('font-weight', 'bold')
            .attr('fill', '#333')
            .attr('text-anchor', 'middle')
            .attr('dy', -15)
            .attr('x', d => d.x || width / 2)
            .attr('y', d => d.y || height / 2)
            .text(d => d.text || d.id)
            .style('pointer-events', 'none');

        // Only add drag and simulation for force layout
        if (layout === 'force' && simulation) {
            node.call(d3.drag()
                .on('start', dragStarted)
                .on('drag', dragged)
                .on('end', dragEnded));

            simulation.on('tick', () => {
                link
                    .attr('x1', d => d.source.x)
                    .attr('y1', d => d.source.y)
                    .attr('x2', d => d.target.x)
                    .attr('y2', d => d.target.y);

                edgeLabel
                    .attr('x', d => (d.source.x + d.target.x) / 2)
                    .attr('y', d => (d.source.y + d.target.y) / 2);

                node
                    .attr('cx', d => d.x)
                    .attr('cy', d => d.y);

                nodeLabel
                    .attr('x', d => d.x)
                    .attr('y', d => d.y);
            });

            function dragStarted(event, d) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            }

            function dragged(event, d) {
                d.fx = event.x;
                d.fy = event.y;
            }

            function dragEnded(event, d) {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }
        }

        // Zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });

        svg.call(zoom);

        return () => {
            if (simulation) simulation.stop();
        };
    }, [data, dimensions, layout, selectedTypes, onNodeClick]);

    // Layout algorithms
    function createForceLayout(nodes, edges, width, height) {
        return d3.forceSimulation(nodes)
            .force('link', d3.forceLink(edges)
                .id(d => d.id)
                .distance(100))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(30));
    }

    function applyHierarchicalLayout(nodes, edges, width, height) {
        // Create hierarchy from edges (simple tree layout)
        const nodeMap = new Map(nodes.map(n => [n.id, n]));
        const children = new Map();

        edges.forEach(edge => {
            const sourceId = edge.source.id || edge.source;
            const targetId = edge.target.id || edge.target;
            if (!children.has(sourceId)) children.set(sourceId, []);
            children.get(sourceId).push(targetId);
        });

        // Find root nodes (nodes with no incoming edges)
        const hasIncoming = new Set(edges.map(e => e.target.id || e.target));
        const roots = nodes.filter(n => !hasIncoming.has(n.id));

        let yLevel = 50;
        const levelHeight = (height - 100) / Math.max(3, Math.sqrt(nodes.length));
        const visited = new Set();

        function layoutLevel(nodeIds, level, xStart, xEnd) {
            const y = yLevel + level * levelHeight;
            const xStep = (xEnd - xStart) / (nodeIds.length + 1);

            nodeIds.forEach((id, i) => {
                if (visited.has(id)) return;
                visited.add(id);

                const node = nodeMap.get(id);
                if (node) {
                    node.x = xStart + (i + 1) * xStep;
                    node.y = y;

                    const childIds = children.get(id) || [];
                    if (childIds.length > 0) {
                        layoutLevel(childIds, level + 1, node.x - 100, node.x + 100);
                    }
                }
            });
        }

        layoutLevel(roots.map(r => r.id), 0, 0, width);

        // Layout any remaining nodes
        nodes.forEach((node, i) => {
            if (!visited.has(node.id)) {
                node.x = 50 + (i % 10) * 80;
                node.y = height - 100;
            }
        });
    }

    function applyCircularLayout(nodes, width, height) {
        const radius = Math.min(width, height) / 2 - 100;
        const centerX = width / 2;
        const centerY = height / 2;

        nodes.forEach((node, i) => {
            const angle = (2 * Math.PI * i) / nodes.length;
            node.x = centerX + radius * Math.cos(angle);
            node.y = centerY + radius * Math.sin(angle);
        });
    }

    function applyGridLayout(nodes, width, height) {
        const cols = Math.ceil(Math.sqrt(nodes.length));
        const rows = Math.ceil(nodes.length / cols);
        const cellWidth = (width - 100) / cols;
        const cellHeight = (height - 100) / rows;

        nodes.forEach((node, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            node.x = 50 + col * cellWidth + cellWidth / 2;
            node.y = 50 + row * cellHeight + cellHeight / 2;
        });
    }

    return (
        <div className={`graph-container ${isFullscreen ? 'fullscreen' : ''}`} ref={containerRef}>
            <GraphControls
                layout={layout}
                onLayoutChange={setLayout}
                entityTypes={entityTypes}
                selectedTypes={selectedTypes}
                onFilterChange={handleFilterChange}
                isFullscreen={isFullscreen}
                onToggleFullscreen={toggleFullscreen}
                onExport={handleExport}
            />
            <svg ref={svgRef} className="graph-svg"></svg>
            {(!data || !data.nodes || data.nodes.length === 0) && (
                <div className="graph-placeholder">
                    <p>No graph data available. Upload a document or ingest text to see the knowledge graph.</p>
                </div>
            )}
        </div>
    );
};

export default GraphVisualization;
