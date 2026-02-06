"""
FastAPI application main entry point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import ingest, query, graph
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-driven knowledge graph platform for semantic data exploration"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(ingest.router, prefix=settings.API_V1_PREFIX, tags=["Ingestion"])
app.include_router(query.router, prefix=settings.API_V1_PREFIX, tags=["Query"])
app.include_router(graph.router, prefix=settings.API_V1_PREFIX, tags=["Graph"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to CortexGraph API",
        "version": settings.APP_VERSION,
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    from app.models import HealthResponse
    from core.nlp_engine import get_nlp_engine
    from core.graph_manager import get_graph_manager
    
    # Check NLP engine
    nlp_loaded = False
    try:
        nlp_engine = get_nlp_engine()
        nlp_loaded = nlp_engine is not None
    except Exception as e:
        logger.error(f"NLP engine check failed: {e}")
    
    # Check Neo4j connection
    neo4j_connected = False
    try:
        graph_manager = get_graph_manager()
        graph_manager.get_stats()
        neo4j_connected = True
    except Exception as e:
        logger.error(f"Neo4j connection check failed: {e}")
    
    return HealthResponse(
        status="healthy" if (nlp_loaded and neo4j_connected) else "degraded",
        version=settings.APP_VERSION,
        neo4j_connected=neo4j_connected,
        nlp_loaded=nlp_loaded
    )


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup."""
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    
    # Create upload directory
    import os
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    # Pre-load NLP engine
    try:
        from core.nlp_engine import get_nlp_engine
        nlp_engine = get_nlp_engine()
        logger.info("NLP engine loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load NLP engine: {e}")
    
    # Test Neo4j connection
    try:
        from core.graph_manager import get_graph_manager
        graph_manager = get_graph_manager()
        stats = graph_manager.get_stats()
        logger.info(f"Neo4j connected. Current stats: {stats}")
    except Exception as e:
        logger.error(f"Failed to connect to Neo4j: {e}")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("Shutting down CortexGraph")
    
    # Close Neo4j connection
    try:
        from core.graph_manager import get_graph_manager
        graph_manager = get_graph_manager()
        graph_manager.close()
    except Exception:
        pass


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
