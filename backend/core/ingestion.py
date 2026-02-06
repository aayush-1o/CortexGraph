"""
Document ingestion and processing module.
"""
import os
from pathlib import Path
from typing import List, Dict, Any, Optional
import logging
from PyPDF2 import PdfReader
from docx import Document as DocxDocument
import json

logger = logging.getLogger(__name__)


class DocumentProcessor:
    """Process various document formats."""
    
    @staticmethod
    def process_pdf(file_path: str) -> str:
        """
        Extract text from PDF file.
        
        Args:
            file_path: Path to PDF file
            
        Returns:
            Extracted text
        """
        try:
            reader = PdfReader(file_path)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text.strip()
        except Exception as e:
            logger.error(f"Error processing PDF {file_path}: {e}")
            raise
    
    @staticmethod
    def process_docx(file_path: str) -> str:
        """
        Extract text from DOCX file.
        
        Args:
            file_path: Path to DOCX file
            
        Returns:
            Extracted text
        """
        try:
            doc = DocxDocument(file_path)
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
            return text.strip()
        except Exception as e:
            logger.error(f"Error processing DOCX {file_path}: {e}")
            raise
    
    @staticmethod
    def process_txt(file_path: str) -> str:
        """
        Read text from TXT file.
        
        Args:
            file_path: Path to TXT file
            
        Returns:
            File contents
        """
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read().strip()
        except Exception as e:
            logger.error(f"Error processing TXT {file_path}: {e}")
            raise
    
    @staticmethod
    def process_json(file_path: str) -> str:
        """
        Read and format JSON file.
        
        Args:
            file_path: Path to JSON file
            
        Returns:
            JSON contents as formatted string
        """
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return json.dumps(data, indent=2)
        except Exception as e:
            logger.error(f"Error processing JSON {file_path}: {e}")
            raise
    
    def process_file(self, file_path: str) -> Dict[str, Any]:
        """
        Process a file and extract content.
        
        Args:
            file_path: Path to file
            
        Returns:
            Dictionary with filename, content, and metadata
        """
        file_path_obj = Path(file_path)
        extension = file_path_obj.suffix.lower()
        
        processors = {
            '.pdf': self.process_pdf,
            '.docx': self.process_docx,
            '.txt': self.process_txt,
            '.json': self.process_json,
        }
        
        processor = processors.get(extension, self.process_txt)
        
        try:
            content = processor(file_path)
            
            return {
                "filename": file_path_obj.name,
                "content": content,
                "metadata": {
                    "file_type": extension,
                    "file_size": file_path_obj.stat().st_size,
                    "path": str(file_path_obj)
                }
            }
        except Exception as e:
            logger.error(f"Failed to process file {file_path}: {e}")
            raise


class DataPipeline:
    """End-to-end data ingestion and graph construction pipeline."""
    
    def __init__(self, nlp_engine, graph_manager):
        """
        Initialize pipeline.
        
        Args:
            nlp_engine: NLP engine instance
            graph_manager: Graph manager instance
        """
        self.nlp_engine = nlp_engine
        self.graph_manager = graph_manager
        self.processor = DocumentProcessor()
    
    def process_document(self, file_path: str) -> Dict[str, Any]:
        """
        Process a document end-to-end: extract text, identify entities, build graph.
        
        Args:
            file_path: Path to document
            
        Returns:
            Processing results with statistics
        """
        import time
        start_time = time.time()
        
        # Extract text
        logger.info(f"Processing document: {file_path}")
        doc_data = self.processor.process_file(file_path)
        content = doc_data["content"]
        
        # Extract entities
        logger.info("Extracting entities...")
        entities = self.nlp_engine.extract_entities(content)
        
        # Extract relationships
        logger.info("Extracting relationships...")
        relationships = self.nlp_engine.extract_relationships(content)
        
        # Build graph
        logger.info("Building knowledge graph...")
        entity_ids = {}
        
        # Add entities to graph
        for entity in entities:
            entity_id = self.graph_manager.add_entity(
                label=entity["label"],
                text=entity["text"],
                properties={
                    "source_document": doc_data["filename"]
                }
            )
            entity_ids[entity["text"]] = entity_id
        
        # Add relationships to graph
        added_relationships = 0
        for rel in relationships:
            source_text = rel["source"]
            target_text = rel["target"]
            
            if source_text in entity_ids and target_text in entity_ids:
                self.graph_manager.add_relationship(
                    source_id=entity_ids[source_text],
                    target_id=entity_ids[target_text],
                    rel_type=rel["relation"],
                    properties={
                        "context": rel.get("context", ""),
                        "source_document": doc_data["filename"]
                    }
                )
                added_relationships += 1
        
        processing_time = time.time() - start_time
        
        result = {
            "filename": doc_data["filename"],
            "entities_extracted": len(entities),
            "relationships_extracted": added_relationships,
            "processing_time": processing_time,
            "metadata": doc_data["metadata"]
        }
        
        logger.info(f"Document processed: {result}")
        return result
