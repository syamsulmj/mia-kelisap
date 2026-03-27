import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContactRule, deleteContactRule, fetchContactRules } from "@/api/contacts";
import type { CreateContactRuleRequest } from "@/types/contacts";

export function useContactRules() {
  return useQuery({ queryKey: ["contact-rules"], queryFn: fetchContactRules });
}

export function useCreateContactRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateContactRuleRequest) => createContactRule(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contact-rules"] }),
  });
}

export function useDeleteContactRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteContactRule,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contact-rules"] }),
  });
}
