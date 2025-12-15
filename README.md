# Ollama

```sh
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama

docker exec -it ollama ollama pull deepseek-r1:8b

docker exec -it ollama ollama run deepseek-r1:8b

curl http://localhost:11434/api/generate -d '{ "model": "deepseek-r1:8b", "prompt":"Hi there" }'
```
