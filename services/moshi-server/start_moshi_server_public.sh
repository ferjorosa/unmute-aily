#!/bin/bash
# This is the public-facing version.
set -ex

export LD_LIBRARY_PATH=$(python3 -c 'import sysconfig; print(sysconfig.get_config_var("LIBDIR"))')

uvx --from 'huggingface_hub[cli]' huggingface-cli login --token $HUGGING_FACE_HUB_TOKEN

# Check if binary already exists in the cached target directory
if [ -f /app/target/release/moshi-server ]; then
    echo "moshi-server binary found in cache, copying to bin directory..."
    cp /app/target/release/moshi-server /root/.cargo/bin/moshi-server
else
    echo "moshi-server binary not found in cache, compiling..."
    CARGO_TARGET_DIR=/app/target cargo install --features cuda moshi-server@0.6.4
fi

# Subtle detail here: We use the full path to `moshi-server` because there is a `moshi-server` binary
# from the `moshi` Python package. We'll fix this conflict soon.
/root/.cargo/bin/moshi-server $@