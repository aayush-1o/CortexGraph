"""
Data models for CortexGraph API.
"""
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime


class Entity(BaseModel):
    """Entity node in knowledge graph."""
    id: Optional[str] = None
    label: str = Field(..., description="Entity type (PERSON, ORG, etc.)")
    text: str = Field(..., description="Entity text/name")
    properties: Dict[str, Any] = Field(default_factory=dict)


class Relationship(BaseModel):
    """Relationship between entities."""
    id: Optional[str] = None
    source: str = Field(..., description="Source entity ID")
    target: str = Field(..., description="Target entity ID")
    type: str = Field(..., description="Relationship type")
    properties: Dict[str, Any] = Field(default_factory=dict)


class Document(BaseModel):
    """Uploaded document."""
    id: Optional[str] = None
    filename: str
    content: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    uploaded_at: Optional[datetime] = None


class GraphData(BaseModel):
    """Graph visualization data."""
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]


class QueryRequest(BaseModel):
    """Semantic query request."""
    query: str = Field(..., description="Natural language query")
    limit: int = Field(default=10, description="Max results")
    include_relationships: bool = Field(default=True)


class QueryResponse(BaseModel):
    """Query response with results."""
    query: str
    results: List[Dict[str, Any]]
    graph_data: Optional[GraphData] = None
    execution_time: float


class UploadResponse(BaseModel):
    """Document upload response."""
    document_id: str
    filename: str
    entities_extracted: int
    relationships_extracted: int
    processing_time: float


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    version: str
    neo4j_connected: bool
    nlp_loaded: bool
