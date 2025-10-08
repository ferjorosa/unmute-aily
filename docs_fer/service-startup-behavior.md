# Service Startup Behavior

This document explains what to expect when starting services with `docker compose up`.

## First-Time Startup (Cold Start)

When starting services for the first time or after clearing volumes:

### STT (Speech-to-Text)
1. ⏳ Downloads Python (~20MB) → cached to `volumes/uv-local/`
2. ⏳ Installs Python packages (~1-2s) → cached to `volumes/uv-cache/`
3. ⏳ Compiles `moshi-server` binary (~3-5 min) → cached to `volumes/stt-target/`
4. ⏳ Downloads STT models (~2GB) → cached to `volumes/huggingface-cache/`
5. ✅ Starts listening on port 8080 (internal)

**Total first-time startup:** ~5-7 minutes

### TTS (Text-to-Speech)
1. ⏳ Downloads Python (~20MB) → cached to `volumes/uv-local/` (shared with STT)
2. ⏳ Installs Python packages (~1-2s) → cached to `volumes/uv-cache/`
3. ⏳ Compiles `moshi-server` binary (~3-5 min) → cached to `volumes/tts-target/`
4. ⏳ Downloads TTS models + voices (~24GB) → cached to `volumes/huggingface-cache/`
5. ✅ Starts listening on port 8080 (internal)

**Total first-time startup:** ~8-12 minutes (voice models are large)

### LLM (Language Model)
1. ⏳ Downloads the specified model (e.g., gemma-3-4b-it ~9GB) → cached to `volumes/huggingface-cache/`
2. 🔄 Loads model into GPU memory
3. ✅ Starts vLLM OpenAI-compatible API on port 8000 (internal)

**Total first-time startup:** ~5-10 minutes (depends on model size)

### Backend
1. 🔄 Installs Python dependencies (if hot-reloading mode)
2. ✅ Starts WebSocket server on port 80 (internal)

**Total startup:** ~5-15 seconds

### Frontend
1. 🔄 Installs Node.js dependencies (if hot-reloading mode)
2. 🔄 Compiles Next.js application
3. ✅ Starts dev server on port 3000 (internal)

**Total startup:** ~10-30 seconds

### Traefik
1. ✅ Starts immediately (reverse proxy)

**Total startup:** < 1 second

---

## Subsequent Startups (Warm Start)

After the first startup, all subsequent `docker compose up` commands are much faster:

### STT (Speech-to-Text)
1. ✅ **Reuses Python** from `volumes/uv-local/` (instant)
2. ✅ **Reuses packages** from `volumes/uv-cache/` (~2s to create venv)
3. ✅ **Copies cached binary** from `volumes/stt-target/` (instant)
4. ✅ **Reuses models** from `volumes/huggingface-cache/` (instant)
5. 🔄 Loads models into GPU memory (~5-10s)
6. ✅ Ready to serve

**Total warm startup:** ~15-20 seconds

### TTS (Text-to-Speech)
1. ✅ **Reuses Python** from `volumes/uv-local/` (instant)
2. ✅ **Reuses packages** from `volumes/uv-cache/` (~2s to create venv)
3. ✅ **Copies cached binary** from `volumes/tts-target/` (instant)
4. ✅ **Reuses models** from `volumes/huggingface-cache/` (instant)
5. 🔄 Loads models and voices into GPU memory (~20-30s)
6. ✅ Ready to serve

**Total warm startup:** ~30-40 seconds

### LLM (Language Model)
1. ✅ **Reuses cached model** from `volumes/huggingface-cache/`
2. 🔄 Loads model into GPU memory (~10-30s depending on model size)
3. ✅ Ready to serve

**Total warm startup:** ~10-30 seconds

### Backend / Frontend / Traefik
- Same as first-time startup (~15-45 seconds combined)

---

## What to Look For in Logs

### ✅ Good Signs (Caching Working)

**STT/TTS:**
```
Using CPython 3.12.8                          ← NOT "Downloading" = cached!
Installed 66 packages in 1.95s                ← Fast = packages cached!
moshi-server binary found in cache...         ← Binary reused!
```

**LLM:**
```
Fetching X files: 100%|...| X/X [00:00...]   ← Fast = model cached!
```

### ⚠️ Potential Issues

**If you see "Downloading Python":**
- The `volumes/uv-local` mount may not be working

**If you see compilation taking minutes:**
- The `volumes/{service}-target` mount may not be working
- Or it's the first startup (expected)

**If you see large model downloads:**
- The `volumes/huggingface-cache` mount may not be working
- Or it's the first startup (expected)

---

## Volume Storage Summary

All cached data is stored in `./volumes/`:

| Directory | Purpose | Size | Shared |
|-----------|---------|------|--------|
| `huggingface-cache/` | HF models (STT, TTS, LLM) | ~35GB | ✅ All services |
| `uv-local/` | Python installation | ~84MB | ✅ STT & TTS |
| `uv-cache/` | Python packages | ~15GB | ✅ STT & TTS |
| `stt-target/` | Compiled STT binary | ~1.2GB | ❌ STT only |
| `tts-target/` | Compiled TTS binary | ~1.2GB | ❌ TTS only |
| `vllm-cache/` | vLLM cache | varies | ❌ LLM only |

**Total disk usage:** ~50-60GB (varies by model choice)

---

## Quick Reference

**First startup:** ☕ Grab coffee (10-15 minutes)  
**Subsequent startups:** 🚀 Fast (30-60 seconds for GPU services)  
**After clearing volumes:** 🔄 Back to first startup time  

**Date:** October 8, 2025

