# 🚀 CortexGraph - Complete Testing Guide

## ✅ No Credentials Required!

**Good news**: Your project works out-of-the-box with NO external APIs or credentials needed!

Everything is self-contained:
- ✅ Neo4j database included in Docker Compose
- ✅ SpaCy models download automatically
- ✅ All services configured to work together

---

## 🏃 Quick Start - Run Everything at Once

### Option 1: Docker Compose (Recommended - Easiest!)

```bash
# Navigate to project
cd C:\Users\Ayush\Desktop\CortexGraph

# Start all services (Neo4j + Backend + Frontend)
docker-compose up -d

# Wait 60 seconds for all services to start
# (Neo4j takes ~30-45 seconds to initialize)
```

**✅ That's it!** Everything is now running:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Neo4j Browser: http://localhost:7474

---

## 🔍 How to Verify Everything is Working

### Step 1: Check if Services are Running

```bash
# Check all containers are running
docker-compose ps
```

**Expected output**:
```
NAME                    STATUS
cortexgraph-backend     Up
cortexgraph-frontend    Up
cortexgraph-neo4j       Up (healthy)
```

### Step 2: Check Backend Health

Open in browser: http://localhost:8000/health

**Expected response**:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "neo4j_connected": true,
  "nlp_loaded": true
}
```

✅ If you see `"status": "healthy"` → Backend is working!

### Step 3: Check Frontend

Open in browser: http://localhost:3000

**You should see**:
- ✅ Purple/gradient header with "CortexGraph"
- ✅ Search bar at top
- ✅ Upload area on left
- ✅ Graph visualization area on right
- ✅ Stats showing "0 Nodes, 0 Edges" (initially empty)

### Step 4: Test with Sample Data

1. **Upload a test document**:
   - Go to http://localhost:3000
   - Drag and drop `C:\Users\Ayush\Desktop\CortexGraph\examples\sample_data\apple_info.txt`
   - Wait 5-10 seconds

2. **Expected result**:
   - ✅ Success message appears
   - ✅ Shows entities extracted (e.g., 10-15 entities)
   - ✅ Shows relationships found (e.g., 5-8 relationships)
   - ✅ Graph visualization updates with colorful nodes
   - ✅ Node counter updates (e.g., "12 Nodes, 6 Edges")

3. **Interact with the graph**:
   - ✅ Click and drag nodes to move them
   - ✅ Scroll to zoom in/out
   - ✅ Click a node to see details in the Info panel
   - ✅ Different colors for different entity types

4. **Test semantic search**:
   - Type: "Steve Jobs"
   - Click Search
   - ✅ Should show related entities and connections

---

## 🛠️ Option 2: Run Services Separately (For Development)

### Terminal 1 - Start Neo4j
```bash
docker run -d --name neo4j-test \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/cortexgraph123 \
  neo4j:5.15

# Wait 30 seconds for Neo4j to start
```

### Terminal 2 - Start Backend
```bash
cd C:\Users\Ayush\Desktop\CortexGraph\backend

# Create virtual environment
python -m venv venv

# Activate it
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy model (first time only)
python -m spacy download en_core_web_sm

# Start backend
uvicorn app.main:app --reload
```

**Backend will start on**: http://localhost:8000

### Terminal 3 - Start Frontend
```bash
cd C:\Users\Ayush\Desktop\CortexGraph\frontend

# Install dependencies (first time only)
npm install

# Start frontend
npm start
```

**Frontend will open automatically on**: http://localhost:3000

---

## 🧪 Complete Test Workflow

### 1. Upload Test Document
```bash
# Using curl (optional - to test backend directly)
curl -X POST "http://localhost:8000/api/v1/ingest" \
  -F "file=@C:\Users\Ayush\Desktop\CortexGraph\examples\sample_data\apple_info.txt"
```

### 2. Check Graph Data
```bash
# Get graph statistics
curl http://localhost:8000/api/v1/stats
```

**Expected**:
```json
{"nodes": 12, "edges": 6}
```

### 3. Test Semantic Search
```bash
# Search for Steve Jobs
curl -X POST "http://localhost:8000/api/v1/query" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"Steve Jobs\", \"limit\": 10}"
```

### 4. View in Neo4j Browser (Optional)
1. Open: http://localhost:7474
2. Login: 
   - Username: `neo4j`
   - Password: `cortexgraph123`
3. Run query: `MATCH (n) RETURN n LIMIT 25`
4. ✅ You should see nodes and relationships!

---

## 📝 Configuration Check

### Backend Config (Already Set!)
File: `backend/app/config.py`

```python
NEO4J_URI = "bolt://localhost:7687"  # ✅ Default works
NEO4J_USER = "neo4j"                  # ✅ Default works
NEO4J_PASSWORD = "cortexgraph123"     # ✅ Already configured
```

### Frontend Config (Already Set!)
File: `frontend/src/services/api.js`

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
// ✅ Default localhost works perfectly
```

### Docker Compose Config (Already Set!)
File: `docker-compose.yml`

- ✅ Neo4j password: `cortexgraph123`
- ✅ All ports configured correctly
- ✅ Services connected via Docker network

**🎉 NO CHANGES NEEDED! Everything works out of the box!**

---

## 🔍 Troubleshooting

### Problem: "Cannot connect to Neo4j"
**Solution**:
```bash
# Wait longer (Neo4j takes 30-60 seconds)
# OR check Neo4j logs:
docker logs cortexgraph-neo4j

# Restart Neo4j:
docker-compose restart neo4j
```

### Problem: "NLP engine not loaded"
**Solution**:
```bash
# Backend will auto-download spaCy model on first run
# If it fails, manually download:
docker exec -it cortexgraph-backend python -m spacy download en_core_web_sm
```

### Problem: "Port already in use"
**Solution**:
```bash
# Check what's using the port:
netstat -ano | findstr :8000
netstat -ano | findstr :3000
netstat -ano | findstr :7474

# Kill the process or change ports in docker-compose.yml
```

### Problem: Frontend shows "Failed to fetch"
**Solution**:
```bash
# Make sure backend is running:
curl http://localhost:8000/health

# Check CORS settings in backend/app/main.py
# (Already configured to allow localhost:3000)
```

---

## 🎯 Expected Behavior Summary

### ✅ Successful Test Checklist

- [ ] Docker containers all show "Up" status
- [ ] http://localhost:8000/health shows "healthy"
- [ ] http://localhost:3000 loads the UI
- [ ] Upload `apple_info.txt` → Success message appears
- [ ] Graph visualization shows colorful nodes
- [ ] Nodes can be dragged and moved
- [ ] Zoom in/out works
- [ ] Click on node shows details
- [ ] Search for "Steve Jobs" returns results
- [ ] Stats update (shows X Nodes, Y Edges)
- [ ] http://localhost:7474 shows Neo4j browser

If all checked → **Everything is working perfectly!** 🎉

---

## 🛑 Stopping the Application

### Option 1: Docker Compose
```bash
# Stop all services
docker-compose down

# Stop and remove all data (fresh start)
docker-compose down -v
```

### Option 2: Manual
```bash
# Stop backend: Ctrl+C in terminal
# Stop frontend: Ctrl+C in terminal
# Stop Neo4j:
docker stop neo4j-test
docker rm neo4j-test
```

---

## 📊 Performance Expectations

### First Run
- Docker pull: ~2-5 minutes
- Neo4j startup: ~30-45 seconds
- Backend startup: ~10-15 seconds
- Frontend build: ~20-30 seconds

### Subsequent Runs
- Docker compose up: ~10 seconds
- Everything ready: ~30 seconds

### Document Processing
- Small text file (1-2 pages): 1-3 seconds
- Medium PDF (5-10 pages): 5-10 seconds
- Large document (20+ pages): 10-30 seconds

---

## 🎓 Demo Script for Recruiters/Interviews

1. **Start application**: `docker-compose up -d` (show one-command deployment)
2. **Open browser**: Navigate to http://localhost:3000
3. **Upload document**: Drag apple_info.txt
4. **Show extraction**: Point out entities and relationships count
5. **Explore graph**: Drag nodes, zoom, click for details
6. **Semantic search**: Search "Steve Jobs" → show results
7. **Show API docs**: http://localhost:8000/docs
8. **Show Neo4j**: http://localhost:7474 (optional - advanced)

**Talk about**:
- "Automatic entity extraction using spaCy NLP"
- "Neo4j graph database for relationship queries"
- "Semantic search using transformers"
- "Interactive D3.js visualization"
- "Full Docker deployment"

---

## 💡 Tips for Best Demo

1. **Pre-upload documents** before a call so graph looks impressive
2. **Use the example files** - they're designed to show relationships
3. **Zoom in on the graph** to show individual relationships clearly
4. **Click nodes** to show the interactive features
5. **Show the code** in VS Code to demonstrate your understanding

---

## ✅ Final Checklist

- [ ] Project runs with `docker-compose up -d`
- [ ] All health checks pass
- [ ] Can upload documents successfully
- [ ] Graph visualization works
- [ ] Search functionality works
- [ ] Can explain the technology stack
- [ ] Ready to show on screen share
- [ ] LinkedIn updated with project link
- [ ] Resume includes project description

**You're ready to impress recruiters!** 🚀
