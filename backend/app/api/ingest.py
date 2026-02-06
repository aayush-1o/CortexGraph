"""
API endpoints for data ingestion.
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models import UploadResponse
from app.config import settings
from core.nlp_engine import get_nlp_engine
from core.graph_manager import get_graph_manager
from core.ingestion import DataPipeline
import os
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/ingest", response_model=UploadResponse)
async def ingest_document(file: UploadFile = File(...)):
    """
    Ingest a document, extract entities and relationships, and build knowledge graph.
    
    Supported formats: PDF, DOCX, TXT, JSON
    """
    # Validate file size
    contents = await file.read()
    if len(contents) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {settings.MAX_UPLOAD_SIZE / 1024 / 1024} MB"
        )
    
    # Save file
    file_path = os.path.join(settings.UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as f:
        f.write(contents)
    
    try:
        # Process document
        nlp_engine = get_nlp_engine()
        graph_manager = get_graph_manager()
        pipeline = DataPipeline(nlp_engine, graph_manager)
        
        result = pipeline.process_document(file_path)
        
        return UploadResponse(
            document_id=file.filename,
            filename=result["filename"],
            entities_extracted=result["entities_extracted"],
            relationships_extracted=result["relationships_extracted"],
            processing_time=result["processing_time"]
        )
    
    except Exception as e:
        logger.error(f"Error processing document: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        # Cleanup uploaded file
        if os.path.exists(file_path):
            os.remove(file_path)


@router.post("/ingest/text")
async def ingest_text(text: str, source: str = "user_input"):
    """
    Ingest raw text directly.
    
    Args:
        text: Text content to process
        source: Source identifier
    """
    try:
        import time
        start_time = time.time()
        
        nlp_engine = get_nlp_engine()
        graph_manager = get_graph_manager()
        
        # Extract entities
        entities = nlp_engine.extract_entities(text)
        
        # Extract relationships
        relationships = nlp_engine.extract_relationships(text)
        
        # Build graph
        entity_ids = {}
        for entity in entities:
            entity_id = graph_manager.add_entity(
                label=entity["label"],
                text=entity["text"],
                properties={"source": source}
            )
            entity_ids[entity["text"]] = entity_id
        
        # Add relationships
        added_relationships = 0
        for rel in relationships:
            if rel["source"] in entity_ids and rel["target"] in entity_ids:
                graph_manager.add_relationship(
                    source_id=entity_ids[rel["source"]],
                    target_id=entity_ids[rel["target"]],
                    rel_type=rel["relation"],
                    properties={"context": rel.get("context", ""), "source": source}
                )
                added_relationships += 1
        
        processing_time = time.time() - start_time
        
        return {
            "entities_extracted": len(entities),
            "relationships_extracted": added_relationships,
            "processing_time": processing_time
        }
    
    except Exception as e:
        logger.error(f"Error processing text: {e}")
        raise HTTPException(status_code=500, detail=str(e))
