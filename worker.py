import os
import torch
from dotenv import load_dotenv

from langchain.chains import RetrievalQA
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import Chroma

from langchain_huggingface import (
    HuggingFaceEndpoint,
    HuggingFaceEmbeddings,
    ChatHuggingFace,
)

DEVICE = "cuda:0" if torch.cuda.is_available() else "cpu"

load_dotenv()

conversation_retrieval_chain = None
chat_history = []
current_document_name = None
llm_hub = None
embeddings = None


def init_llm():
    global llm_hub, embeddings

    api_token = os.getenv("HUGGINGFACEHUB_API_TOKEN")
    if not api_token:
        raise RuntimeError(
            "HUGGINGFACEHUB_API_TOKEN is required. Set it in the environment or .env file."
        )

    base_llm = HuggingFaceEndpoint(
        repo_id="meta-llama/Llama-3.1-8B-Instruct",
        task="text-generation",
        huggingfacehub_api_token=api_token,
        temperature=0.1,
        max_new_tokens=600,
    )

    llm_hub = ChatHuggingFace(llm=base_llm)

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        model_kwargs={"device": DEVICE},
    )


def reset_session():
    global conversation_retrieval_chain, chat_history, current_document_name
    conversation_retrieval_chain = None
    chat_history.clear()
    current_document_name = None


def process_document(document_path, original_filename="document.pdf"):
    global conversation_retrieval_chain, chat_history, current_document_name

    if llm_hub is None or embeddings is None:
        init_llm()

    loader = PyPDFLoader(document_path)
    documents = loader.load()

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1024,
        chunk_overlap=64
    )
    texts = text_splitter.split_documents(documents)

    db = Chroma.from_documents(texts, embedding=embeddings)

    retrieval_chain = RetrievalQA.from_chain_type(
        llm=llm_hub,
        chain_type="stuff",
        retriever=db.as_retriever(search_kwargs={"k": 3}),
        return_source_documents=False,
        input_key="question",
    )
    conversation_retrieval_chain = retrieval_chain
    chat_history.clear()
    current_document_name = original_filename


def process_prompt(prompt):
    if conversation_retrieval_chain is None:
        raise RuntimeError("Process a document before asking a question.")

    if chat_history:
        history_text = "\n".join(f"Q: {q}\nA: {a}" for q, a in chat_history[-3:])
        full_prompt = f"Previous conversation:\n{history_text}\n\nNew question: {prompt}"
    else:
        full_prompt = prompt

    output = conversation_retrieval_chain.invoke({"question": full_prompt})
    answer = output["result"]

    chat_history.append((prompt, answer))
    return answer.strip()



