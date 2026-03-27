import chromadb

from mia_kelisap.config import settings


class MemoryService:
    def __init__(self) -> None:
        self._client: chromadb.HttpClient | None = None

    @property
    def client(self) -> chromadb.HttpClient:
        if self._client is None:
            self._client = chromadb.HttpClient(
                host=settings.chroma_host, port=settings.chroma_port
            )
        return self._client

    def _collection_name(self, user_id: str) -> str:
        return f"user_{user_id}_memory"

    def store(
        self,
        user_id: str,
        document: str,
        metadata: dict[str, str],
        doc_id: str,
    ) -> None:
        collection = self.client.get_or_create_collection(
            name=self._collection_name(user_id)
        )
        collection.add(documents=[document], metadatas=[metadata], ids=[doc_id])

    def search(
        self,
        user_id: str,
        query: str,
        n_results: int = 5,
    ) -> list[dict[str, str | dict[str, str]]]:
        try:
            collection = self.client.get_collection(name=self._collection_name(user_id))
        except Exception:
            return []

        results = collection.query(query_texts=[query], n_results=n_results)
        items: list[dict[str, str | dict[str, str]]] = []
        if results["documents"] and results["ids"] and results["metadatas"]:
            for i, doc in enumerate(results["documents"][0]):
                items.append(
                    {
                        "id": results["ids"][0][i],
                        "content": doc,
                        "metadata": results["metadatas"][0][i] or {},
                    }
                )
        return items

    def delete(self, user_id: str, doc_id: str) -> None:
        try:
            collection = self.client.get_collection(name=self._collection_name(user_id))
            collection.delete(ids=[doc_id])
        except Exception:
            pass

    def list_memories(
        self, user_id: str, limit: int = 50, offset: int = 0
    ) -> list[dict[str, str | dict[str, str]]]:
        try:
            collection = self.client.get_collection(name=self._collection_name(user_id))
        except Exception:
            return []

        results = collection.get(limit=limit, offset=offset)
        items: list[dict[str, str | dict[str, str]]] = []
        if results["documents"] and results["ids"]:
            for i, doc in enumerate(results["documents"]):
                items.append(
                    {
                        "id": results["ids"][i],
                        "content": doc,
                        "metadata": (results["metadatas"] or [{}])[i] or {},
                    }
                )
        return items
