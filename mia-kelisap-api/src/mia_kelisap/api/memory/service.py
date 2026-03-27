from mia_kelisap.api.memory.schemas import MemoryItem, MemoryListResponse
from mia_kelisap.services.memory import MemoryService

memory_service = MemoryService()


class MemoryAPIService:
    @staticmethod
    def search(user_id: str, query: str, n_results: int = 5) -> MemoryListResponse:
        results = memory_service.search(user_id, query, n_results)
        items = [
            MemoryItem(
                id=str(r["id"]),
                content=str(r["content"]),
                metadata=r.get("metadata", {}),  # type: ignore[arg-type]
            )
            for r in results
        ]
        return MemoryListResponse(memories=items)

    @staticmethod
    def list_memories(
        user_id: str, limit: int = 50, offset: int = 0
    ) -> MemoryListResponse:
        results = memory_service.list_memories(user_id, limit, offset)
        items = [
            MemoryItem(
                id=str(r["id"]),
                content=str(r["content"]),
                metadata=r.get("metadata", {}),  # type: ignore[arg-type]
            )
            for r in results
        ]
        return MemoryListResponse(memories=items)

    @staticmethod
    def delete_memory(user_id: str, memory_id: str) -> None:
        memory_service.delete(user_id, memory_id)
