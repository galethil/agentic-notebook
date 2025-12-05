#!/bin/bash

# SUMMARY
# This script starts the Ollama application inside a Docker container.
# docker run -d --name ollama -p 11434:11434 ollama/ollama
# docker exec -it ollama ollama run llama2

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "${GREEN}Starting Ollama in Docker...${NC}"

running_message() {
    echo "${GREEN}✓ Ollama is already running${NC}"
    echo "  API endpoint: http://localhost:11434"
    echo "  Models stored in: ${OLLAMA_VOLUME}"
    echo ""
    echo "To pull a model, run: docker exec -it ollama ollama pull <model-name>"
    echo "Example: docker exec -it ollama ollama pull llama2"
    echo ""
    echo "To run a model, run: docker exec -it ollama ollama run <model-name>"
    echo "Example: docker exec -it ollama ollama run llama2
    echo ""
    echo "Browse available models at: https://ollama.com/models"
}

# Create volume directory if it doesn't exist
OLLAMA_VOLUME="${HOME}/.ollama"
mkdir -p "${OLLAMA_VOLUME}"

# Check if container is already running
if [ "$(docker ps -q -f name=ollama)" ]; then
    echo "${YELLOW}Ollama container is already running${NC}"
    running_message
    exit 0
fi

# Remove existing stopped container if it exists
if [ "$(docker ps -aq -f name=ollama)" ]; then
    echo "Removing existing Ollama container..."
    docker rm ollama
fi

# Detect if GPU is available (NVIDIA)
if command -v nvidia-smi &> /dev/null; then
    echo "${GREEN}NVIDIA GPU detected, starting with GPU support${NC}"
    docker run -d \
        --gpus=all \
        --name ollama \
        -p 11434:11434 \
        -v "${OLLAMA_VOLUME}:/root/.ollama" \
        --restart unless-stopped \
        ollama/ollama
else
    echo "${YELLOW}No GPU detected, starting with CPU only${NC}"
    docker run -d \
        --name ollama \
        -p 11434:11434 \
        -v "${OLLAMA_VOLUME}:/root/.ollama" \
        --restart unless-stopped \
        ollama/ollama
fi

# Wait for container to be ready
echo "Waiting for Ollama to be ready..."
sleep 3

# Check if container is running
if [ "$(docker ps -q -f name=ollama)" ]; then
    running_message
else
    echo -e "${YELLOW}Failed to start Ollama container${NC}"
    exit 1
fi
