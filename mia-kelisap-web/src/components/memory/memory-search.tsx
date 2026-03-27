import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function MemorySearch({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState("");

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSearch(query); }} className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <Input placeholder="Search memories semantically..." value={query} onChange={(e) => setQuery(e.target.value)} className="border-input bg-background pl-10" />
    </form>
  );
}
