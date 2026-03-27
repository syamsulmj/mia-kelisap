from typing import Any

import anthropic
import openai

from mia_kelisap.core.encryption import decrypt_value


class LLMService:
    @staticmethod
    async def generate(
        provider: str,
        api_key_encrypted: str,
        system_prompt: str,
        messages: list[dict[str, str]],
        model: str | None = None,
    ) -> str:
        api_key = decrypt_value(api_key_encrypted)

        if provider == "openai":
            return await LLMService._call_openai(
                api_key, system_prompt, messages, model or "gpt-4o-mini"
            )
        elif provider == "claude":
            return await LLMService._call_claude(
                api_key,
                system_prompt,
                messages,
                model or "claude-sonnet-4-6-20250514",
            )
        else:
            raise ValueError(f"Unknown LLM provider: {provider}")

    @staticmethod
    async def _call_openai(
        api_key: str,
        system_prompt: str,
        messages: list[dict[str, str]],
        model: str,
    ) -> str:
        client = openai.AsyncOpenAI(api_key=api_key)
        all_messages: list[dict[str, Any]] = [
            {"role": "system", "content": system_prompt}
        ]
        all_messages.extend(messages)
        response = await client.chat.completions.create(
            model=model,
            messages=all_messages,  # type: ignore[arg-type]
            max_tokens=1024,
        )
        return response.choices[0].message.content or ""

    @staticmethod
    async def _call_claude(
        api_key: str,
        system_prompt: str,
        messages: list[dict[str, str]],
        model: str,
    ) -> str:
        client = anthropic.AsyncAnthropic(api_key=api_key)
        response = await client.messages.create(
            model=model,
            max_tokens=1024,
            system=system_prompt,
            messages=messages,  # type: ignore[arg-type]
        )
        content_block = response.content[0]
        if hasattr(content_block, "text"):
            return content_block.text  # type: ignore[no-any-return]
        return ""
