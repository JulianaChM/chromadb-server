FROM chromadb/chroma:latest

# Render requiere exponer el puerto 10000 por defecto
EXPOSE 10000

# Forzamos a la imagen oficial a correr en el puerto de Render y guardar los datos
CMD ["--host", "0.0.0.0", "--port", "10000", "--data-dir", "/chroma-data"]