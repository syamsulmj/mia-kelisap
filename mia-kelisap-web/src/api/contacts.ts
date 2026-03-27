import { apiClient } from "./client";
import type { ContactRule, ContactRuleList, CreateContactRuleRequest } from "@/types/contacts";

export async function fetchContactRules(): Promise<ContactRuleList> {
  const res = await apiClient.get<ContactRuleList>("/contacts");
  return res.data;
}

export async function createContactRule(data: CreateContactRuleRequest): Promise<ContactRule> {
  const res = await apiClient.post<ContactRule>("/contacts", data);
  return res.data;
}

export async function deleteContactRule(ruleId: string): Promise<void> {
  await apiClient.delete(`/contacts/${ruleId}`);
}
