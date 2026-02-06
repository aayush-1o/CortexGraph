# CortexGraph - Example Usage Guide

## Quick Test with Sample Data

1. **Start the application**:
   ```bash
   docker-compose up -d
   ```

2. **Wait for services to be ready** (about 30-60 seconds)

3. **Open your browser** to http://localhost:3000

4. **Upload a sample document**:
   - Use `examples/sample_data/apple_info.txt` or `amazon_info.txt`
   - Drag and drop the file into the upload area
   - Watch as entities and relationships are automatically extracted!

5. **Try semantic search**:
   - "Who founded Apple?"
   - "Show connections between Steve Jobs and Apple"
   - "Find all CEOs"
   - "What companies are in California?"

6. **Explore the graph**:
   - Click and drag nodes to reposition
   - Zoom in/out with scroll wheel
   - Click nodes to see details
   - Different colors represent different entity types

## Example Queries

### Sample Questions to Ask

- "Find all people connected to Apple"
- "Show companies in the technology sector"
- "Who are the competitors of Amazon?"
- "What products did Steve Jobs introduce?"
- "Show all organizations and their locations"

### Expected Entities from Sample Data

**apple_info.txt**:
- Organizations: Apple Inc., Microsoft, Google
- People: Steve Jobs, Steve Wozniak, Ronald Wayne, Tim Cook
- Products: iPhone, MacBook, iPad, Apple Watch
- Locations: Cupertino, California, Apple Park
- Dates: 1976, 2007, 2011, 2023

**amazon_info.txt**:
- Organizations: Amazon, AWS, Microsoft Azure, Google Cloud Platform
- People: Jeff Bezos, Andy Jassy
- Locations: Seattle, Washington, United States
- Dates: 1994, 2006, 2021
- Products/Services: Amazon Prime, Amazon Spheres

## Testing the API Directly

### Upload a document:
```bash
curl -X POST "http://localhost:8000/api/v1/ingest" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@examples/sample_data/apple_info.txt"
```

### Semantic search:
```bash
curl -X POST "http://localhost:8000/api/v1/query" \
  -H "Content-Type: application/json" \
  -d '{"query": "Steve Jobs", "limit": 10, "include_relationships": true}'
```

### Get graph data:
```bash
curl "http://localhost:8000/api/v1/graph?limit=100"
```

### Get statistics:
```bash
curl "http://localhost:8000/api/v1/stats"
```

## Tips for Best Results

1. **Upload multiple documents** to see relationships across different sources
2. **Use descriptive search queries** - the system understands meaning, not just keywords
3. **Experiment with the graph visualization** - try rearranging nodes to see patterns
4. **Check the entity types** by their colors in the graph
5. **Use the Neo4j browser** (http://localhost:7474) to run custom Cypher queries

## Common Entity Types

- **PERSON** (Red): People, individuals
- **ORG** (Teal): Organizations, companies
- **GPE** (Blue): Geopolitical entities, locations
- **DATE** (Light Coral): Dates, times
- **PRODUCT** (Light Green): Products, services
- **MONEY** (Gold): Monetary values
- **EVENT** (Yellow): Named events

## Troubleshooting

### Backend not responding?
Check if services are running:
```bash
docker-compose ps
```

### Neo4j connection failed?
Wait a bit longer - Neo4j can take 30-60s to fully start.

### No entities extracted?
Try uploading a different document with clearer entity mentions (names, places, organizations).

### Graph visualization empty?
Make sure you've uploaded at least one document successfully.
