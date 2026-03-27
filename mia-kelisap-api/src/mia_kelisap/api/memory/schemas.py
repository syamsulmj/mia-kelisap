from pydantic import BaseModel


class MemoryItem(BaseModel):
    id: str
    content: str
    metadata: dict[str, str]


class MemorySearchRequest(BaseModel):
    query: str
    n_results: int = 5


class MemoryListResponse(BaseModel):
    memories: list[MemoryItem]
