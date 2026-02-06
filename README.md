# 🧠 CortexGraph

<div align="center">

![CortexGraph Logo](https://img.shields.io/badge/CortexGraph-AI--Powered-blueviolet?style=for-the-badge)

**AI-Driven Knowledge Graph Platform for Semantic Data Exploration**

[![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)](https://reactjs.org/)
[![Neo4j](https://img.shields.io/badge/Neo4j-5.15-008CC1?logo=neo4j)](https://neo4j.com/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker)](https://www.docker.com/)

</div>

---

## 🌟 Overview

CortexGraph transforms scattered, unstructured data into an **intelligent, interconnected knowledge network**. Using cutting-edge NLP and AI, it automatically extracts entities and relationships from documents, databases, and APIs, then stores them in a graph database for powerful semantic search and visualization.

### 🎯 Key Features

- **🤖 AI-Powered Entity Extraction**: Uses spaCy and transformers to identify people, organizations, locations, dates, and more
- **🔗 Automatic Relationship Discovery**: Leverages dependency parsing to find connections between entities
- **🔍 Semantic Search**: Query by meaning, not just keywords, using sentence embeddings
- **📊 Interactive Graph Visualization**: Beautiful D3.js force-directed graph with zoom, drag, and click interactions
- **📁 Multi-Format Support**: Process PDF, DOCX, TXT, and JSON documents
- **⚡ Real-Time Updates**: See your knowledge graph grow as you add documents
- **🐳 One-Command Deployment**: Complete Docker Compose setup for instant deployment

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React + D3.js)                │
│  ┌───────────┐  ┌─────────────┐  ┌────────────────────┐    │
│  │  Search   │  │   Upload    │  │   Graph Viz        │    │
│  │   Bar     │  │  Interface  │  │  (Force-Directed)  │    │
│  └───────────┘  └─────────────┘  └────────────────────┘    │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST API
┌──────────────────────────▼──────────────────────────────────┐
│                    Backend (FastAPI)                         │
│  ┌──────────────┐  ┌───────────────┐  ┌─────────────────┐  │
│  │   Ingestion  │  │  NLP Engine   │  │  Query Engine   │  │
│  │   Pipeline   │  │ (spaCy/Trans) │  │   (Semantic)    │  │
│  └──────────────┘  └───────────────┘  └─────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                  Graph Database (Neo4j)                      │
│              Nodes (Entities) + Edges (Relations)            │
└──────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- 4GB+ RAM recommended
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/aayush-1o/CortexGraph.git
   cd CortexGraph
   ```

2. **Start the application**
   ```bash
   docker-compose up -d
   ```

3. **Access the platform**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8000
   - **API Docs**: http://localhost:8000/docs
   - **Neo4j Browser**: http://localhost:7474 (username: `neo4j`, password: `cortexgraph123`)

That's it! 🎉

---

## 💻 Usage

### 1. Upload Documents

- Drag and drop files (PDF, DOCX, TXT, JSON) into the upload area
- The system automatically:
  - Extracts text content
  - Identifies entities (people, organizations, locations, etc.)
  - Discovers relationships between entities
  - Builds the knowledge graph

### 2. Semantic Search

- Type natural language queries like:
  - "Find connections between Apple and Steve Jobs"
  - "Show all organizations in California"
  - "What products are related to technology?"
- Results include relevant entities and their relationship subgraphs

### 3. Explore the Graph

- **Zoom**: Scroll to zoom in/out
- **Pan**: Click and drag the background
- **Move nodes**: Drag individual nodes to rearrange
- **Click nodes**: View entity details
- **Hover**: See tooltips with entity information

---

## 🛠️ Technology Stack

### Backend
- **Python 3.11** - Core language
- **FastAPI** - High-performance async web framework
- **spaCy** - Industrial-strength NLP
- **Transformers** - State-of-the-art language models
- **Sentence-Transformers** - Semantic embeddings
- **Neo4j** - Graph database
- **PyPDF2, python-docx** - Document processing

### Frontend
- **React 18** - UI framework
- **D3.js** - Graph visualization
- **Material-UI (MUI)** - Modern component library
- **Axios** - HTTP client
- **React-Dropzone** - File upload

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

---

## 📡 API Endpoints

### Ingestion
- `POST /api/v1/ingest` - Upload and process a document
- `POST /api/v1/ingest/text` - Process raw text

### Query
- `POST /api/v1/query` - Semantic search
- `GET /api/v1/search/{text}` - Simple text search
- `GET /api/v1/entity/{id}` - Get entity with neighbors

### Graph
- `GET /api/v1/graph` - Get full graph data
- `GET /api/v1/stats` - Graph statistics
- `DELETE /api/v1/graph` - Clear graph (caution!)
- `POST /api/v1/cypher` - Execute custom Cypher query

### Health
- `GET /health` - System health check

Full interactive API documentation available at `/docs` when running.

---

## 🎨 Example Use Cases

1. **Enterprise Knowledge Management**
   - Connect information across departments and documents
   - Find subject matter experts and their areas of expertise
   - Discover hidden relationships in corporate data

2. **Research & Academia**
   - Map connections between papers, authors, and concepts
   - Find related research topics
   - Visualize citation networks

3. **Due Diligence & Investigations**
   - Trace relationships between companies and individuals
   - Uncover hidden connections
   - Timeline analysis of events

4. **Customer Intelligence**
   - Link customers, products, and feedback
   - Identify patterns and trends
   - Personalization opportunities

---

## 🔧 Development Setup

### Backend Development

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
uvicorn app.main:app --reload
```

### Frontend Development

```bash
cd frontend
npm install
npm start
```

### Neo4j (Standalone)

```bash
docker run -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/cortexgraph123 \
  neo4j:5.15
```

---

## 🎯 Roadmap

- [ ] Multi-language NLP support
- [ ] Advanced entity resolution (fuzzy matching)
- [ ] Temporal graph queries
- [ ] Export graph as GraphML/GEXF
- [ ] Real-time collaboration
- [ ] Custom entity types
- [ ] API key authentication
- [ ] Cloud deployment templates (AWS, GCP, Azure)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- spaCy team for amazing NLP tools
- Neo4j for graph database excellence
- D3.js community for visualization inspiration
- FastAPI for making Python web development delightful

---

## 📧 Contact

**Ayush** - [GitHub](https://github.com/aayush-1o) - [LinkedIn](https://www.linkedin.com/in/ayushh-o1)

Project Link: [https://github.com/aayush-1o/CortexGraph](https://github.com/aayush-1o/CortexGraph)

---

<div align="center">

![Stars](https://img.shields.io/github/stars/aayush-1o/CortexGraph?style=social)
![Forks](https://img.shields.io/github/forks/aayush-1o/CortexGraph?style=social)

</div>
