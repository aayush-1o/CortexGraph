"""
NLP Engine for entity and relationship extraction.
"""
import spacy
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Tuple, Any
import logging

logger = logging.getLogger(__name__)


class NLPEngine:
    """NLP engine for entity extraction and relationship discovery."""
    
    def __init__(self, spacy_model: str = "en_core_web_sm", embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"):
        """Initialize NLP models."""
        logger.info(f"Loading spaCy model: {spacy_model}")
        try:
            self.nlp = spacy.load(spacy_model)
        except OSError:
            logger.warning(f"Model {spacy_model} not found, downloading...")
            import subprocess
            subprocess.run(["python", "-m", "spacy", "download", spacy_model])
            self.nlp = spacy.load(spacy_model)
        
        logger.info(f"Loading embedding model: {embedding_model}")
        self.embedding_model = SentenceTransformer(embedding_model)
        
    def extract_entities(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract named entities from text.
        
        Args:
            text: Input text
            
        Returns:
            List of entity dictionaries with label, text, start, end
        """
        doc = self.nlp(text)
        entities = []
        
        for ent in doc.ents:
            entities.append({
                "label": ent.label_,
                "text": ent.text,
                "start": ent.start_char,
                "end": ent.end_char,
                "embedding": None  # Can add entity embeddings later
            })
        
        return entities
    
    def extract_relationships(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract relationships between entities using dependency parsing.
        
        Args:
            text: Input text
            
        Returns:
            List of relationship dictionaries
        """
        doc = self.nlp(text)
        relationships = []
        
        # Create entity map
        entities_in_doc = {ent.start: ent for ent in doc.ents}
        
        # Extract subject-verb-object patterns
        for token in doc:
            if token.pos_ == "VERB":
                # Find subjects
                subjects = [child for child in token.children if child.dep_ in ("nsubj", "nsubjpass")]
                # Find objects
                objects = [child for child in token.children if child.dep_ in ("dobj", "pobj", "attr")]
                
                for subject in subjects:
                    for obj in objects:
                        # Check if subject and object are entities
                        subj_ent = self._find_entity_for_token(subject, entities_in_doc)
                        obj_ent = self._find_entity_for_token(obj, entities_in_doc)
                        
                        if subj_ent and obj_ent:
                            relationships.append({
                                "source": subj_ent.text,
                                "source_label": subj_ent.label_,
                                "target": obj_ent.text,
                                "target_label": obj_ent.label_,
                                "relation": token.lemma_,
                                "context": token.sent.text
                            })
        
        return relationships
    
    def _find_entity_for_token(self, token, entity_map: Dict) -> Any:
        """Find entity that contains the given token."""
        for start, ent in entity_map.items():
            if start <= token.i < start + len(ent):
                return ent
        return None
    
    def get_embedding(self, text: str) -> List[float]:
        """
        Generate semantic embedding for text.
        
        Args:
            text: Input text
            
        Returns:
            Embedding vector as list of floats
        """
        embedding = self.embedding_model.encode(text, convert_to_numpy=True)
        return embedding.tolist()
    
    def find_similar(self, query: str, candidates: List[str], top_k: int = 5) -> List[Tuple[str, float]]:
        """
        Find most similar texts to query using semantic similarity.
        
        Args:
            query: Query text
            candidates: List of candidate texts
            top_k: Number of top results to return
            
        Returns:
            List of (text, similarity_score) tuples
        """
        query_embedding = self.embedding_model.encode(query, convert_to_numpy=True)
        candidate_embeddings = self.embedding_model.encode(candidates, convert_to_numpy=True)
        
        # Compute cosine similarity
        from sklearn.metrics.pairwise import cosine_similarity
        similarities = cosine_similarity([query_embedding], candidate_embeddings)[0]
        
        # Get top-k
        top_indices = similarities.argsort()[-top_k:][::-1]
        results = [(candidates[i], float(similarities[i])) for i in top_indices]
        
        return results


# Global instance
_nlp_engine = None


def get_nlp_engine() -> NLPEngine:
    """Get or create global NLP engine instance."""
    global _nlp_engine
    if _nlp_engine is None:
        from app.config import settings
        _nlp_engine = NLPEngine(
            spacy_model=settings.SPACY_MODEL,
            embedding_model=settings.EMBEDDING_MODEL
        )
    return _nlp_engine
