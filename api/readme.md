# RoadmapAI Python API

This is the Python backend for the RoadmapAI application. It uses FastAPI to provide a REST API that generates intelligent roadmap topics using OpenAI.

## Local Setup

1. Create a virtual environment:
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   - On Windows: `venv\Scripts\activate`
   - On macOS/Linux: `source venv/bin/activate`

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Create a `.env` file with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

5. Run the API server:
   ```
   python roadmap_generator.py
   ```
   
   Or using uvicorn directly:
   ```
   uvicorn roadmap_generator:app --reload --host 0.0.0.0 --port 8080
   ```

6. Access the interactive API documentation:
   - Swagger UI: http://localhost:8080/docs
   - ReDoc: http://localhost:8080/redoc

## API Endpoints

### Health Check

- **URL**: `/api/health`
- **Method**: `GET`
- **Response**: `{"status": "healthy"}`

### Generate Roadmap Topics

- **URL**: `/api/generate-roadmap`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "description": "Your business description here"
  }
  ```
- **Response**:
  ```json
  {
    "market": ["Topic 1", "Topic 2", "Topic 3"],
    "product": ["Topic 1", "Topic 2", "Topic 3"],
    "tech": ["Topic 1", "Topic 2", "Topic 3"]
  }
  ```

## How It Works

1. The FastAPI backend receives a business description from the frontend
2. It validates the request data using Pydantic models
3. It sends the description to OpenAI's API with a structured prompt
4. It processes the response and returns the roadmap topics in JSON format
5. The frontend uses these topics to display the roadmap visualization

## Benefits of FastAPI

- Fast performance with async support
- Automatic API documentation
- Data validation with Pydantic
- Built-in error handling
- Production-ready when you're ready to scale