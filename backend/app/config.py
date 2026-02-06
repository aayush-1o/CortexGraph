"""
Configuration settings for CortexGraph backend.
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings."""
    
    # Application
    APP_NAME: str = "CortexGraph"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # API
    API_V1_PREFIX: str = "/api/v1"
    CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:5173"]
    
    # Neo4j Database
    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = "cortexgraph123"
    
    # NLP Models
    SPACY_MODEL: str = "en_core_web_sm"
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    
    # File Upload
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10 MB
    
    # Processing
    BATCH_SIZE: int = 32
    MAX_WORKERS: int = 4
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
