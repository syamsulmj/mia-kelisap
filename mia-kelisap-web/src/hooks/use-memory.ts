import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteMemory, fetchMemories, searchMemories } from "@/api/memory";

export function useMemories() {
  return useQuery({ queryKey: ["memories"], queryFn: () => fetchMemories() });
}

export function useSearchMemories(query: string) {
  return useQuery({
    queryKey: ["memories", "search", query],
    queryFn: () => searchMemories(query),
    enabled: query.length > 0,
  });
}

export function useDeleteMemory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteMemory,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["memories"] }),
  });
}
