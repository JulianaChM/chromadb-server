FROM python:3.11-slim

# Instalar dependencias necesarias
RUN pip install --no-cache-dir chromadb fastapi uvicorn

# Render detecta automáticamente el puerto 10000 por defecto
EXPOSE 10000

CMD ["uvicorn", "chromadb.app:app", "--host", "0.0.0.0", "--port", "10000", "--workers", "1", "--proxy-headers", "--forwarded-allow-ips", "*"]