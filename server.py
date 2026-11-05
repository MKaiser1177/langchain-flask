import os
import tempfile
from flask import Flask, jsonify, request, render_template

import worker

app = Flask(__name__, template_folder="templates", static_folder="static")
app.config["MAX_CONTENT_LENGTH"] = 50 * 1024 * 1024


@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")


@app.route("/status", methods=["GET"])
def status():
    has_doc = worker.conversation_retrieval_chain is not None
    doc_name = getattr(worker, "current_document_name", None)
    history_count = len(worker.chat_history) if hasattr(worker, "chat_history") else 0
    return jsonify({
        "status": "ready" if has_doc else "awaiting_document",
        "hasDocument": has_doc,
        "documentName": doc_name,
        "historyCount": history_count,
    })


@app.route("/reset", methods=["POST"])
def reset():
    if hasattr(worker, "reset_session"):
        worker.reset_session()
    else:
        worker.conversation_retrieval_chain = None
        if hasattr(worker, "chat_history"):
            worker.chat_history.clear()
    return jsonify({
        "status": "ok",
        "botResponse": "Brain memory cleared! Drop a new PDF to start fresh."
    })


@app.route("/process-message", methods=["POST"])
def process_message():
    if not request.is_json:
        return jsonify({"error": "Request body must be JSON."}), 400

    data = request.get_json()
    if not isinstance(data, dict):
        return jsonify({"error": "Request body must be a JSON object."}), 400

    user_message = data.get("userMessage")
    if not isinstance(user_message, str) or not user_message.strip():
        return jsonify({"error": "Message cannot be empty."}), 400

    if worker.conversation_retrieval_chain is None:
        return jsonify({
            "error": "Please upload a PDF document first so I can explore it with you!",
            "code": "NO_DOCUMENT"
        }), 409

    try:
        bot_response = worker.process_prompt(user_message.strip())
    except Exception as exc:
        app.logger.exception("Failed to process chatbot message")
        return jsonify({
            "error": f"DocuBot encountered an issue answering: {str(exc)}"
        }), 500

    return jsonify({"botResponse": bot_response})


@app.route("/process-document", methods=["POST"])
def process_document():
    uploaded_file = request.files.get("file")
    if uploaded_file is None or not uploaded_file.filename:
        return jsonify({"error": "A PDF file is required."}), 400

    if not uploaded_file.filename.lower().endswith(".pdf"):
        return jsonify({"error": "Only PDF files are supported! Please choose a .pdf document."}), 400

    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            document_path = os.path.join(temp_dir, "upload.pdf")
            uploaded_file.save(document_path)
            worker.process_document(document_path, original_filename=uploaded_file.filename)
    except Exception as exc:
        app.logger.exception("Failed to process uploaded PDF")
        return jsonify({
            "error": f"Could not process PDF: {str(exc)}"
        }), 500

    return jsonify({
        "status": "ok",
        "filename": uploaded_file.filename,
        "botResponse": f"⚡ Woohoo! I've fully indexed **{uploaded_file.filename}** into my quantum brain! Ask me anything about this document."
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
