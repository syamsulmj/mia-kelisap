export interface ContactRule {
  id: string;
  contact_jid: string;
  rule_type: "allow" | "block";
  contact_name: string;
  created_at: string;
}

export interface ContactRuleList {
  rules: ContactRule[];
}

export interface CreateContactRuleRequest {
  contact_jid: string;
  rule_type: "allow" | "block";
  contact_name?: string;
}
