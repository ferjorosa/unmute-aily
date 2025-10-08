# Voice Cloning and Text-to-Speech System

## Overview

This system enables real-time conversations with AI using voice cloning technology. It separates voice identity from speech content, allowing any voice to speak any text without retraining models.

## How It Works

### Two-Stage Pipeline

1. **Voice Cloning** - Captures "who is speaking"
2. **Text-to-Speech** - Handles "what is being said"

### Voice Cloning Process

When you upload a voice sample:

1. **Audio Processing**: Your 10+ second voice sample goes to the MIMI voice cloning model
2. **Embedding Generation**: The model extracts your unique vocal characteristics (pitch, tone, accent) into a small mathematical representation called an "embedding"
3. **Caching**: This embedding is stored for 1 hour, so you don't need to re-process it

### Text-to-Speech Process

During conversation:

1. **Text Input**: The AI generates text responses
2. **Voice Application**: The TTS model combines the text with your cached voice embedding
3. **Audio Output**: Streams realistic speech in your voice in real-time

## Technical Architecture

### Models Used

- **Voice Cloning**: `kyutai/unmute-voice-cloning` (MIMI-based neural audio codec)
- **Text-to-Speech**: `kyutai/tts-1.6b-en_fr` (1.6 billion parameter transformer)

### Voice Types

**Predefined Voices** (from `voices.yaml`):
- Pre-processed voice embeddings stored as `.safetensors` files
- Primary storage: `kyutai/tts-voices` Hugging Face repository
- Local cache: `/scratch/models/` (production) or `~/models/tts-voices` (dev)
- Include voices like "Watercooler", "Quiz show", "Gertrude", etc.
- Loaded at TTS server startup, instantly available during conversation

**Custom Voices**:
- Generated when users upload audio samples
- Processed once via MIMI voice cloning model
- Cached in memory for 1 hour (MessagePack format)
- Identified with "custom:" prefix

### Performance Characteristics

- **Voice Cloning**: Happens once per upload (expensive operation)
- **TTS Synthesis**: Real-time streaming (optimized for conversation)
- **Latency**: ~220ms for first audio chunk
- **Caching**: Prevents repeated processing

## Data Flow

### Custom Voices
```
User Upload → MIMI Model → Voice Embedding → Memory Cache (1hr)
                                ↓
Text Input → TTS Model ← Cached Embedding → Audio Output
```

### Predefined Voices
```
Audio Files → MIMI Model → .safetensors → Hugging Face Repository
                                ↓
TTS Server Startup ← Load Embeddings ← Local Cache
                                ↓
Text Input → TTS Model ← Pre-loaded Embedding → Audio Output
```

## Key Benefits

- **Efficient**: Voice cloning happens once, not every conversation
- **Real-time**: TTS optimized for streaming conversation
- **Modular**: Any voice can speak any content
- **Scalable**: Separate services can scale independently

## File Locations

### Code
- Voice cloning logic: `unmute/tts/voice_cloning.py`
- TTS integration: `unmute/tts/text_to_speech.py`
- Voice definitions: `voices.yaml`
- Server configs: `services/moshi-server/configs/`

### Voice Storage
- **Predefined embeddings**: `kyutai/tts-voices` (Hugging Face)
- **Local audio files**: `voices/unmute-prod-website/`
- **Production cache**: `/scratch/models/`
- **Development cache**: `~/models/tts-voices`
- **Custom voice cache**: In-memory (1-hour TTL)

## Usage Notes

- Voice samples should be 10+ seconds for best quality
- Custom voice embeddings expire after 1 hour
- System supports English and French
- Designed for real-time conversation, not batch processing
