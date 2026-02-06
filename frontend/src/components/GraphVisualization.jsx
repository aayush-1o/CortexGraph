import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './GraphVisualization.css';

const GraphVisualization = ({ data, onNodeClick }) => {
    const svgRef = useRef();
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

    useEffect(() => {
        const updateDimensions = () => {
            const container = svgRef.current?.parentElement;
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
    }, []);

    useEffect(() => {
        if (!data || !data.nodes || data.nodes.length === 0) return;

        const { width, height } = dimensions;

        // Clear previous visualization
        d3.select(svgRef.current).selectAll('*').remove();

        // Create SVG
        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height);

        // Create container for zoom
        const g = svg.append('g');

        // Color scale for node types
        const colorScale = d3.scaleOrdinal()
            .domain(['PERSON', 'ORG', 'GPE', 'DATE', 'PRODUCT', 'EVENT', 'WORK_OF_ART', 'LOC', 'MONEY'])
            .range(['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739']);

        // Create force simulation
        const simulation = d3.forceSimulation(data.nodes)
            .force('link', d3.forceLink(data.edges)
                .id(d => d.id)
                .distance(100))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(30));

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
            .data(data.edges)
            .enter().append('line')
            .attr('stroke', '#999')
            .attr('stroke-opacity', 0.6)
            .attr('stroke-width', 2)
            .attr('marker-end', 'url(#arrow)');

        // Create edge labels
        const edgeLabel = g.append('g')
            .selectAll('text')
            .data(data.edges)
            .enter().append('text')
            .attr('font-size', 10)
            .attr('fill', '#666')
            .attr('text-anchor', 'middle')
            .text(d => d.type || d.label);

        // Create nodes
        const node = g.append('g')
            .selectAll('circle')
            .data(data.nodes)
            .enter().append('circle')
            .attr('r', 10)
            .attr('fill', d => colorScale(d.label || d.group || 'PERSON'))
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .style('cursor', 'pointer')
            .call(d3.drag()
                .on('start', dragStarted)
                .on('drag', dragged)
                .on('end', dragEnded))
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
            .data(data.nodes)
            .enter().append('text')
            .attr('font-size', 12)
            .attr('font-weight', 'bold')
            .attr('fill', '#333')
            .attr('text-anchor', 'middle')
            .attr('dy', -15)
            .text(d => d.text || d.id)
            .style('pointer-events', 'none');

        // Zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });

        svg.call(zoom);

        // Update positions on simulation tick
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

        // Drag functions
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

        return () => {
            simulation.stop();
        };
    }, [data, dimensions, onNodeClick]);

    return (
        <div className="graph-container">
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
