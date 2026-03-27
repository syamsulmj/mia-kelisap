from mia_kelisap.services.filter import FilterService


def test_detects_credit_card() -> None:
    assert FilterService.contains_sensitive_info("My card is 4111-1111-1111-1111")


def test_detects_password() -> None:
    assert FilterService.contains_sensitive_info("password: mysecret123")


def test_detects_api_key() -> None:
    assert FilterService.contains_sensitive_info("Use this key: sk-abc123xyz")


def test_clean_text_passes() -> None:
    assert not FilterService.contains_sensitive_info(
        "Hey, can we meet at 3pm tomorrow?"
    )


def test_redact() -> None:
    result = FilterService.redact_sensitive_info("My card is 4111-1111-1111-1111")
    assert "[REDACTED]" in result
    assert "4111" not in result
