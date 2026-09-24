"""
Pए Backend — Configuration
"""
import os

# Demo mode: when True, uses deterministic mock AI responses
DEMO_MODE = os.getenv("DEMO_MODE", "true").lower() == "true"

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./pae_demo.db")

# AI Provider (used when DEMO_MODE is False)
AI_PROVIDER = os.getenv("AI_PROVIDER", "openai")  # openai | azure | anthropic
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
AZURE_SPEECH_KEY = os.getenv("AZURE_SPEECH_KEY", "")

# Interview
INTERVIEW_COMPLETION_THRESHOLD = int(os.getenv("INTERVIEW_COMPLETION_THRESHOLD", "85"))

# CORS
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
