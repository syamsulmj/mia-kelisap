from fastapi import APIRouter, Query, status

from mia_kelisap.api.memory.schemas import MemoryListResponse, MemorySearchRequest
from mia_kelisap.api.memory.service import MemoryAPIService
from mia_kelisap.dependencies import CurrentUser

router = APIRouter()


@router.get("", response_model=MemoryListResponse)
async def list_memories(
    user: CurrentUser,
    limit: int = Query(default=50, le=200),
    offset: int = Query(default=0, ge=0),
) -> MemoryListResponse:
    return MemoryAPIService.list_memories(user.id, limit, offset)


@router.post("/search", response_model=MemoryListResponse)
async def search_memories(
    user: CurrentUser, data: MemorySearchRequest
) -> MemoryListResponse:
    return MemoryAPIService.search(user.id, data.query, data.n_results)


@router.delete("/{memory_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_memory(memory_id: str, user: CurrentUser) -> None:
    MemoryAPIService.delete_memory(user.id, memory_id)
