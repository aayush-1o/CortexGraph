"""
API endpoints for graph exploration and visualization.
"""
from fastapi import APIRouter, HTTPException
from app.models import GraphData
from core.graph_manager import get_graph_manager
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/graph", response_model=GraphData)
async def get_graph(limit: int = 100):
    """
    Get the entire knowledge graph for visualization.
    
    Args:
        limit: Maximum number of nodes to return
    """
    try:
        graph_manager = get_graph_manager()
        data = graph_manager.get_all_nodes_and_edges(limit=limit)
        
        # Format for frontend
        nodes = [
            {
                "id": node["id"],
                "label": node["label"],
                "text": node["text"],
                "group": node["label"]  # For D3.js coloring
            }
            for node in data["nodes"]
        ]
        
        edges = [
            {
                "source": edge["source"],
                "target": edge["target"],
                "type": edge["type"],
                "label": edge["type"]
            }
            for edge in data["edges"]
        ]
        
        return GraphData(nodes=nodes, edges=edges)
    
    except Exception as e:
        logger.error(f"Error getting graph: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def get_stats():
    """Get knowledge graph statistics."""
    try:
        graph_manager = get_graph_manager()
        stats = graph_manager.get_stats()
        return stats
    
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/graph")
async def clear_graph():
    """
    Clear all data from the knowledge graph.
    
    WARNING: This operation cannot be undone!
    """
    try:
        graph_manager = get_graph_manager()
        graph_manager.clear_graph()
        return {"message": "Graph cleared successfully"}
    
    except Exception as e:
        logger.error(f"Error clearing graph: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cypher")
async def execute_cypher(query: str):
    """
    Execute a custom Cypher query.
    
    Args:
        query: Cypher query string
    """
    try:
        graph_manager = get_graph_manager()
        results = graph_manager.execute_cypher(query)
        return {"results": results}
    
    except Exception as e:
        logger.error(f"Error executing Cypher: {e}")
        raise HTTPException(status_code=500, detail=str(e))
