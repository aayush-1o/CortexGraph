import * as d3 from 'd3';

export const exportAsPNG = async (svgElement, filename = 'cortexgraph') => {
    try {
        // Get SVG data
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        // Set canvas size to match SVG
        const svgSize = svgElement.getBoundingClientRect();
        canvas.width = svgSize.width * 2; // 2x for better quality
        canvas.height = svgSize.height * 2;

        // Create blob from SVG
        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        return new Promise((resolve, reject) => {
            img.onload = () => {
                ctx.fillStyle = '#0F172A'; // Dark background
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                canvas.toBlob((blob) => {
                    const link = document.createElement('a');
                    link.download = `${filename}.png`;
                    link.href = URL.createObjectURL(blob);
                    link.click();
                    URL.revokeObjectURL(url);
                    resolve();
                });
            };
            img.onerror = reject;
            img.src = url;
        });
    } catch (error) {
        console.error('Error exporting PNG:', error);
        throw error;
    }
};

export const exportAsSVG = (svgElement, filename = 'cortexgraph') => {
    try {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const link = document.createElement('a');
        link.download = `${filename}.svg`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
    } catch (error) {
        console.error('Error exporting SVG:', error);
        throw error;
    }
};

export const exportAsJSON = (graphData, filename = 'cortexgraph') => {
    try {
        const data = JSON.stringify(graphData, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const link = document.createElement('a');
        link.download = `${filename}.json`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
    } catch (error) {
        console.error('Error exporting JSON:', error);
        throw error;
    }
};

export const exportAsGraphML = (graphData, filename = 'cortexgraph') => {
    try {
        let graphML = '<?xml version="1.0" encoding="UTF-8"?>\n';
        graphML += '<graphml xmlns="http://graphml.graphdrawing.org/xmlns"\n';
        graphML += '         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n';
        graphML += '         xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns\n';
        graphML += '         http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">\n';

        // Define keys for node attributes
        graphML += '  <key id="label" for="node" attr.name="label" attr.type="string"/>\n';
        graphML += '  <key id="text" for="node" attr.name="text" attr.type="string"/>\n';
        graphML += '  <key id="type" for="edge" attr.name="type" attr.type="string"/>\n';

        graphML += '  <graph id="G" edgedefault="directed">\n';

        // Add nodes
        graphData.nodes.forEach(node => {
            graphML += `    <node id="${node.id}">\n`;
            graphML += `      <data key="label">${node.label || 'UNKNOWN'}</data>\n`;
            graphML += `      <data key="text">${escapeXML(node.text || node.id)}</data>\n`;
            graphML += `    </node>\n`;
        });

        // Add edges
        graphData.edges.forEach((edge, index) => {
            const sourceId = edge.source.id || edge.source;
            const targetId = edge.target.id || edge.target;
            graphML += `    <edge id="e${index}" source="${sourceId}" target="${targetId}">\n`;
            graphML += `      <data key="type">${edge.type || edge.label || 'RELATED'}</data>\n`;
            graphML += `    </edge>\n`;
        });

        graphML += '  </graph>\n';
        graphML += '</graphml>';

        const blob = new Blob([graphML], { type: 'application/xml' });
        const link = document.createElement('a');
        link.download = `${filename}.graphml`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
    } catch (error) {
        console.error('Error exporting GraphML:', error);
        throw error;
    }
};

function escapeXML(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}
