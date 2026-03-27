import re
from typing import ClassVar

_SENSITIVE_PATTERNS = [
    re.compile(r"\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b"),
    re.compile(r"\b\d{3}-\d{2}-\d{4}\b"),
    re.compile(r"\b[A-Z]{1,2}\d{6,9}\b"),
    re.compile(r"(?i)\b(?:password|passwd|pwd)\s*[:=]\s*\S+"),
    re.compile(r"(?i)\b(?:pin|cvv|cvc)\s*[:=]?\s*\d{3,6}\b"),
    re.compile(r"(?i)\b(?:sk-|pk_live_|sk_live_|api[_-]?key)\S+"),
]


class FilterService:
    SENSITIVE_PATTERNS: ClassVar[list[re.Pattern[str]]] = _SENSITIVE_PATTERNS

    @staticmethod
    def contains_sensitive_info(text: str) -> bool:
        return any(p.search(text) for p in FilterService.SENSITIVE_PATTERNS)

    @staticmethod
    def redact_sensitive_info(text: str) -> str:
        result = text
        for pattern in FilterService.SENSITIVE_PATTERNS:
            result = pattern.sub("[REDACTED]", result)
        return result
