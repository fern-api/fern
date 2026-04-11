---
title: API Versioning
slug: versioning
description: Understand how API versions work and how to manage breaking changes.
---

# API Versioning

The Acme API uses date-based versioning to manage changes. Each version is identified by a release date in `YYYY-MM-DD` format. When you make a request, specify the version using the `Acme-Version` header.

## Version Header

```bash
curl https://api.acme.com/v1/resources \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Acme-Version: 2025-01-15"
```

If no version header is provided, the API defaults to the version that was current when your account was created.

## Versioning Policy

- **Stable versions** are supported for at least 18 months after a newer version is released
- **Deprecated versions** continue to function but return a `Sunset` header indicating the retirement date
- **Breaking changes** are never introduced within a version — only additive changes are allowed

## Breaking vs Non-Breaking Changes

### Non-Breaking (within a version)

- Adding new optional request parameters
- Adding new response fields
- Adding new enum values to response fields
- Adding new API endpoints
- Adding new webhook event types

### Breaking (new version required)

- Removing or renaming existing fields
- Changing the type of an existing field
- Changing default values for existing parameters
- Removing API endpoints
- Changing authentication mechanisms

## Migration Guide Between Versions

When upgrading to a new API version, review the changelog for the target version. Each changelog entry documents what changed and provides migration steps.

```python
import acme

# Pin your client to a specific version
client = acme.Client(
    api_key="YOUR_API_KEY",
    api_version="2025-01-15"
)
```

## Version Lifecycle

| Phase | Duration | Description |
|-------|----------|-------------|
| Current | Ongoing | Latest version, receives all new features |
| Supported | 18 months | Receives security patches and critical fixes |
| Deprecated | 6 months | Functions but returns deprecation warnings |
| Retired | — | Requests return `410 Gone` |

## Checking Your Version

To see which version your request used, check the `Acme-Version` response header. The API also returns `Acme-Latest-Version` so you can detect when a newer version is available.
