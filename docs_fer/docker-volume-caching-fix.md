# Docker Volume Caching Fix for STT/TTS Services

## Problem

Every time `docker compose up` was run, the STT and TTS services were re-downloading and recompiling components, causing slow startup times (several minutes).

## Root Cause

The `start_moshi_server_public.sh` script runs on every container startup and:
1. Downloads Python (~20MB) to `/root/.local/share/uv/python/`
2. Installs Python packages to a virtual environment
3. Compiles/installs the Rust `moshi-server` binary (~53MB) to `/root/.cargo/bin/`

**These directories were NOT mounted as volumes**, so they were stored in the container's ephemeral filesystem and lost on every restart.

### What Was Already Cached
- ✅ HuggingFace models (26GB) - `volumes/huggingface-cache`
- ✅ Cargo registry and build artifacts
- ✅ UV package cache (15GB)

### What Was NOT Cached
- ❌ Compiled `moshi-server` binary (73MB in `/root/.cargo/bin/`)
- ❌ Python installation (82MB in `/root/.local/share/uv/python/`)

## Solution

### 1. Added UV Local Volume Mount

Added volume mount for Python installations in `docker-compose.yml`:

```yaml
# For both TTS and STT services:
volumes:
  - ./volumes/cargo-registry-{service}:/root/.cargo/registry
  - ./volumes/{service}-target:/app/target
  - ./volumes/uv-cache:/root/.cache/uv
  - ./volumes/uv-local:/root/.local/share/uv              # ← NEW (shared)
  - ./volumes/huggingface-cache:/root/.cache/huggingface
  - /tmp/models/:/models
  - ./volumes/{service}-logs:/logs
```

### 2. Modified Startup Script

Updated `start_moshi_server_public.sh` to check if the compiled binary exists in the cached target directory before recompiling:

```bash
# Check if binary already exists in the cached target directory
if [ -f /app/target/release/moshi-server ]; then
    echo "moshi-server binary found in cache, copying to bin directory..."
    cp /app/target/release/moshi-server /root/.cargo/bin/moshi-server
else
    echo "moshi-server binary not found in cache, compiling..."
    CARGO_TARGET_DIR=/app/target cargo install --features cuda moshi-server@0.6.4
fi
```

**Why not mount `/root/.cargo/bin` as a volume?**
- The Rust toolchain (cargo, rustup) is already installed there in the image
- Mounting an empty volume would hide these tools and break the build
- Instead, we cache the compiled artifacts in `/app/target` and copy the binary on startup (instant)

## Changes Made

1. Created new volume directory:
   ```bash
   mkdir -p volumes/uv-local
   ```

2. Added volume mount in `docker-compose.yml`:
   - `./volumes/uv-local:/root/.local/share/uv` (shared between services)

3. Modified `services/moshi-server/start_moshi_server_public.sh` to:
   - Check if binary exists in `/app/target/release/moshi-server`
   - Copy it if found (fast)
   - Compile it if not found (only first time)

## Result

- **Before:** ~3-5 minutes to compile and download on every restart
- **After:** Fast startup on subsequent restarts (only first restart needs to populate volumes)

## Date
October 8, 2025

