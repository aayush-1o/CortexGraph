"""
API endpoints for querying the knowledge graph.
"""
from fastapi import APIRouter, HTTPException
from app.models import QueryRequest, QueryResponse, GraphData
from core.nlp_engine import get_nlp_engine
from core.graph_manager import get_graph_manager
import logging
import time

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/query", response_model=QueryResponse)
async def semantic_query(request: QueryRequest):
    """
    Perform semantic search on the knowledge graph.
    
    Uses NLP embeddings to find relevant entities and relationships.
    """
    try:
        start_time = time.time()
        
        nlp_engine = get_nlp_engine()
        graph_manager = get_graph_manager()
        
        # Extract entities from query
        query_entities = nlp_engine.extract_entities(request.query)
        
        # Search for matching entities in graph
        results = []
        all_nodes = []
        all_edges = []
        
        # Search by entity mentions
        for entity in query_entities:
            matches = graph_manager.query_by_text(entity["text"], limit=request.limit)
            
            for match in matches:
                # Get neighbors for each match
                if request.include_relationships:
                    neighbors = graph_manager.get_entity_neighbors(match["id"], depth=1)
                    all_nodes.extend(neighbors["nodes"])
                    all_edges.extend(neighbors["edges"])
                
                results.append(match)
        
        # Also do keyword search on query text
        keyword_matches = graph_manager.query_by_text(request.query, limit=request.limit)
        results.extend(keyword_matches)
        
        # Remove duplicates
        unique_results = {r["id"]: r for r in results}.values()
        
        # Prepare graph data
        graph_data = None
        if request.include_relationships and all_nodes:
            # Deduplicate nodes and edges
            unique_nodes = {n["id"]: n for n in all_nodes}.values()
            unique_edges = {f"{e['source']}-{e['type']}-{e['target']}": e for e in all_edges}.values()
            
            graph_data = GraphData(
                nodes=[{"id": n["id"], "label": n["label"], "text": n["text"]} for n in unique_nodes],
                edges=[{"source": e["source"], "target": e["target"], "type": e["type"]} for e in unique_edges]
            )
        
        execution_time = time.time() - start_time
        
        return QueryResponse(
            query=request.query,
            results=list(unique_results),
            graph_data=graph_data,
            execution_time=execution_time
        )
    
    except Exception as e:
        logger.error(f"Error executing query: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search/{text}")
async def simple_search(text: str, limit: int = 10):
    """
    Simple text-based search for entities.
    
    Args:
        text: Search text
        limit: Maximum results to return
    """
    try:
        graph_manager = get_graph_manager()
        results = graph_manager.query_by_text(text, limit=limit)
        return {"results": results}
    
    except Exception as e:
        logger.error(f"Error in search: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/entity/{entity_id}")
async def get_entity(entity_id: str, depth: int = 1):
    """
    Get an entity and its neighbors.
    
    Args:
        entity_id: Entity ID
        depth: Relationship depth to traverse
    """
    try:
        graph_manager = get_graph_manager()
        neighbors = graph_manager.get_entity_neighbors(entity_id, depth=depth)
        return neighbors
    
    except Exception as e:
        logger.error(f"Error getting entity: {e}")
        raise HTTPException(status_code=500, detail=str(e))
