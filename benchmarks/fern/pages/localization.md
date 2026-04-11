---
title: Localization
slug: localization
description: Serve content and format data in your users' locale.
---

# Localization

The Acme API supports localization for currencies, dates, error messages, and content. Set locale preferences per-request or at the account level.

## Setting the Locale

### Per-Request

Use the `Accept-Language` header to specify the locale for a single request:

```bash
curl https://api.acme.com/v1/products \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept-Language: fr-FR"
```

### Account Default

Set a default locale for your account. This applies to all requests that don't include an `Accept-Language` header:

```bash
curl -X PATCH https://api.acme.com/v1/account/settings \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"default_locale": "de-DE"}'
```

## Supported Locales

The API supports all ISO 639-1 language codes combined with ISO 3166-1 country codes. Common locales include:

| Locale | Language | Region |
|--------|----------|--------|
| `en-US` | English | United States |
| `en-GB` | English | United Kingdom |
| `fr-FR` | French | France |
| `de-DE` | German | Germany |
| `es-ES` | Spanish | Spain |
| `ja-JP` | Japanese | Japan |
| `zh-CN` | Chinese | China |
| `pt-BR` | Portuguese | Brazil |
| `ko-KR` | Korean | South Korea |
| `ar-SA` | Arabic | Saudi Arabia |

## Currency Formatting

Monetary amounts are always returned as integers in the smallest currency unit (e.g., cents for USD). The API includes formatting hints based on the locale:

```json
{
  "amount": 4999,
  "currency": "usd",
  "formatted": "$49.99",
  "locale_formatted": {
    "en-US": "$49.99",
    "de-DE": "49,99 $",
    "ja-JP": "$49.99"
  }
}
```

## Date and Time Formatting

Timestamps are always returned in ISO 8601 UTC format. For display purposes, the `formatted_dates` expansion provides locale-specific formatting:

```bash
curl "https://api.acme.com/v1/orders/order_123?expand=formatted_dates" \
  -H "Accept-Language: de-DE" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "created_at": "2025-03-15T14:30:00Z",
  "formatted_dates": {
    "created_at": "15. Mrz. 2025, 14:30 Uhr"
  }
}
```

## Error Messages

Error messages are localized when an `Accept-Language` header is provided:

```json
{
  "error": {
    "code": "insufficient_funds",
    "message": "Solde insuffisant pour cette transaction.",
    "message_en": "Insufficient funds for this transaction."
  }
}
```

The `message_en` field is always included as a fallback.

## Translatable Content

For resources with user-facing content (product names, descriptions), store translations using the translations API:

```python
import acme

client = acme.Client(api_key="YOUR_API_KEY")

# Set translations for a product
client.products.set_translations("prod_123", {
    "en-US": {"name": "Wireless Headphones", "description": "Premium noise-cancelling headphones"},
    "fr-FR": {"name": "Casque sans fil", "description": "Casque antibruit premium"},
    "de-DE": {"name": "Kabellose Kopfhorer", "description": "Premium-Kopfhorer mit Gerauschunterdruckung"}
})

# Fetch with locale
product = client.products.get("prod_123", locale="fr-FR")
print(product.name)  # "Casque sans fil"
```

## Right-to-Left (RTL) Support

For RTL languages (Arabic, Hebrew), the API includes a `text_direction` field in responses:

```json
{
  "locale": "ar-SA",
  "text_direction": "rtl"
}
```

Use this hint to adjust your UI layout accordingly.
