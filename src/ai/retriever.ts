import { vectorStore } from "./chroma";

export const retriever =
  vectorStore.asRetriever({
    k: 5
  });