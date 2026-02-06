"""
Graph database manager for Neo4j operations.
"""
from neo4j import GraphDatabase
from typing import List, Dict, Any, Optional
import logging
import hashlib

logger = logging.getLogger(__name__)


class GraphManager:
    """Manager for Neo4j graph database operations."""
    
    def __init__(self, uri: str, user: str, password: str):
        """Initialize Neo4j connection."""
        logger.info(f"Connecting to Neo4j at {uri}")
        self.driver = GraphDatabase.driver(uri, auth=(user, password))
        self._initialize_constraints()
    
    def close(self):
        """Close database connection."""
        self.driver.close()
    
    def _initialize_constraints(self):
        """Create indexes and constraints."""
        with self.driver.session() as session:
            # Create uniqueness constraint on entity ID
            session.run("CREATE CONSTRAINT entity_id IF NOT EXISTS FOR (e:Entity) REQUIRE e.id IS UNIQUE")
            # Create index on entity text for faster lookups
            session.run("CREATE INDEX entity_text IF NOT EXISTS FOR (e:Entity) ON (e.text)")
    
    def add_entity(self, label: str, text: str, properties: Optional[Dict[str, Any]] = None) -> str:
        """
        Add or update an entity node.
        
        Args:
            label: Entity type (PERSON, ORG, etc.)
            text: Entity text/name
            properties: Additional properties
            
        Returns:
            Entity ID
        """
        entity_id = self._generate_id(f"{label}:{text}")
        props = properties or {}
        props.update({"id": entity_id, "label": label, "text": text})
        
        with self.driver.session() as session:
            result = session.run(
                """
                MERGE (e:Entity {id: $id})
                SET e += $properties
                RETURN e.id as id
                """,
                id=entity_id,
                properties=props
            )
            return result.single()["id"]
    
    def add_relationship(self, source_id: str, target_id: str, rel_type: str, 
                        properties: Optional[Dict[str, Any]] = None) -> str:
        """
        Add a relationship between entities.
        
        Args:
            source_id: Source entity ID
            target_id: Target entity ID
            rel_type: Relationship type
            properties: Additional properties
            
        Returns:
            Relationship ID
        """
        rel_id = self._generate_id(f"{source_id}:{rel_type}:{target_id}")
        props = properties or {}
        props["id"] = rel_id
        
        with self.driver.session() as session:
            # Sanitize relationship type (uppercase, replace spaces with underscore)
            safe_rel_type = rel_type.upper().replace(" ", "_").replace("-", "_")
            
            result = session.run(
                f"""
                MATCH (source:Entity {{id: $source_id}})
                MATCH (target:Entity {{id: $target_id}})
                MERGE (source)-[r:{safe_rel_type}]->(target)
                SET r += $properties
                RETURN r
                """,
                source_id=source_id,
                target_id=target_id,
                properties=props
            )
            return rel_id
    
    def get_all_nodes_and_edges(self, limit: int = 100) -> Dict[str, List[Dict[str, Any]]]:
        """
        Get all nodes and edges for visualization.
        
        Args:
            limit: Maximum number of nodes to return
            
        Returns:
            Dictionary with 'nodes' and 'edges' lists
        """
        with self.driver.session() as session:
            # Get nodes
            nodes_result = session.run(
                """
                MATCH (e:Entity)
                RETURN e.id as id, e.label as label, e.text as text, e
                LIMIT $limit
                """,
                limit=limit
            )
            
            nodes = []
            for record in nodes_result:
                node_data = dict(record["e"])
                nodes.append({
                    "id": record["id"],
                    "label": record["label"],
                    "text": record["text"],
                    "properties": node_data
                })
            
            # Get edges
            edges_result = session.run(
                """
                MATCH (source:Entity)-[r]->(target:Entity)
                RETURN source.id as source, target.id as target, type(r) as type, r
                LIMIT $limit
                """,
                limit=limit * 2
            )
            
            edges = []
            for record in edges_result:
                rel_data = dict(record["r"])
                edges.append({
                    "source": record["source"],
                    "target": record["target"],
                    "type": record["type"],
                    "properties": rel_data
                })
            
            return {"nodes": nodes, "edges": edges}
    
    def query_by_text(self, text: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Query entities by text match.
        
        Args:
            text: Search text
            limit: Maximum results
            
        Returns:
            List of matching entities
        """
        with self.driver.session() as session:
            result = session.run(
                """
                MATCH (e:Entity)
                WHERE toLower(e.text) CONTAINS toLower($text)
                RETURN e
                LIMIT $limit
                """,
                text=text,
                limit=limit
            )
            
            return [dict(record["e"]) for record in result]
    
    def get_entity_neighbors(self, entity_id: str, depth: int = 1) -> Dict[str, List[Dict[str, Any]]]:
        """
        Get neighbors of an entity up to specified depth.
        
        Args:
            entity_id: Entity ID
            depth: Relationship depth
            
        Returns:
            Dictionary with nodes and edges
        """
        with self.driver.session() as session:
            result = session.run(
                f"""
                MATCH path = (start:Entity {{id: $entity_id}})-[*1..{depth}]-(connected:Entity)
                WITH nodes(path) as nodes, relationships(path) as rels
                UNWIND nodes as n
                WITH collect(DISTINCT {{id: n.id, label: n.label, text: n.text}}) as nodes_list,
                     [r in rels | {{source: startNode(r).id, target: endNode(r).id, type: type(r)}}] as edges_list
                RETURN nodes_list, edges_list
                """,
                entity_id=entity_id
            )
            
            record = result.single()
            if record:
                return {
                    "nodes": record["nodes_list"],
                    "edges": record["edges_list"]
                }
            return {"nodes": [], "edges": []}
    
    def execute_cypher(self, query: str, parameters: Optional[Dict] = None) -> List[Dict[str, Any]]:
        """
        Execute a custom Cypher query.
        
        Args:
            query: Cypher query string
            parameters: Query parameters
            
        Returns:
            Query results
        """
        with self.driver.session() as session:
            result = session.run(query, parameters or {})
            return [dict(record) for record in result]
    
    def clear_graph(self):
        """Clear all nodes and relationships (use with caution!)."""
        with self.driver.session() as session:
            session.run("MATCH (n) DETACH DELETE n")
            logger.warning("Graph database cleared")
    
    def get_stats(self) -> Dict[str, int]:
        """Get graph statistics."""
        with self.driver.session() as session:
            result = session.run(
                """
                MATCH (n:Entity)
                OPTIONAL MATCH ()-[r]->()
                RETURN count(DISTINCT n) as node_count, count(r) as edge_count
                """
            )
            record = result.single()
            return {
                "nodes": record["node_count"],
                "edges": record["edge_count"]
            }
    
    @staticmethod
    def _generate_id(text: str) -> str:
        """Generate deterministic ID from text."""
        return hashlib.md5(text.encode()).hexdigest()[:16]


# Global instance
_graph_manager = None


def get_graph_manager() -> GraphManager:
    """Get or create global graph manager instance."""
    global _graph_manager
    if _graph_manager is None:
        from app.config import settings
        _graph_manager = GraphManager(
            uri=settings.NEO4J_URI,
            user=settings.NEO4J_USER,
            password=settings.NEO4J_PASSWORD
        )
    return _graph_manager
