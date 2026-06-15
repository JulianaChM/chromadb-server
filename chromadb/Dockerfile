FROM python:3.11-slim

RUN pip install chromadb

EXPOSE 10000

CMD ["chroma","run","--host","0.0.0.0","--port","10000","--path","/chroma-data"]