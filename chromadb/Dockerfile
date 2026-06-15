FROM chromadb/chroma:latest

# Render requiere exponer el puerto 10000 por defecto
EXPOSE 10000

# Añadimos el comando "run" exigido por la nueva versión de ChromaDB
CMD ["run", "--host", "0.0.0.0", "--port", "10000"]
