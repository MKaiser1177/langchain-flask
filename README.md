# Sparky AI — DocuBot

Sparky is a LangChain and Flask web app that lets you upload a PDF and ask questions about its contents. It uses LangChain for retrieval-augmented question answering, Hugging Face for the language model and embeddings, and a playful browser-based chat interface.

## Features

- Upload a PDF and ask questions grounded in its contents.
- Keep a short conversation history while exploring the document.
- Reset the current document and chat session at any time.
- Use the interface at `http://localhost:8000`.

## Requirements

- Python 3.10 or later
- A Hugging Face access token with access to the configured inference model

The app uses `meta-llama/Llama-3.1-8B-Instruct` for answering questions and `sentence-transformers/all-MiniLM-L6-v2` for embeddings. The embedding model is downloaded when first needed.

## Run locally

From the project directory, create and activate a virtual environment, then install the dependencies:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

Set your Hugging Face token before starting the app:

```powershell
$env:HUGGINGFACEHUB_API_TOKEN = "your-hugging-face-token"
python server.py
```

Alternatively, put the token in a `.env` file in the project root:

```dotenv
HUGGINGFACEHUB_API_TOKEN=your-hugging-face-token
```

Keep `.env` private; it is excluded from Git. Open `http://localhost:8000`, upload a PDF, and start asking questions. Uploads are limited to 50 MB by the server.

## Docker

Build the image:

```powershell
docker build -t sparky-docubot .
```

Run it with your token supplied through the environment:

```powershell
docker run --rm -p 8000:8000 -e HUGGINGFACEHUB_API_TOKEN="your-hugging-face-token" sparky-docubot
```

Then open `http://localhost:8000`.

## API

- `GET /status` — report whether a PDF is loaded and the current chat-history count.
- `POST /process-document` — upload a PDF using the multipart form field `file`.
- `POST /process-message` — submit JSON such as `{"userMessage": "What is this document about?"}`.
- `POST /reset` — clear the current document and chat history.
