---
title: Audit Logs
slug: audit-logs
description: Track all actions and changes in your account with audit logs.
---

# Audit Logs

The Acme API maintains a comprehensive audit log of all actions performed in your account. Audit logs are immutable and retained for 90 days on all plans, with extended retention available on Enterprise.

## Accessing Audit Logs

```bash
curl "https://api.acme.com/v1/audit-logs?limit=50" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Response

```json
{
  "data": [
    {
      "id": "log_abc123",
      "timestamp": "2025-03-15T14:30:00Z",
      "actor": {
        "type": "user",
        "id": "user_xyz",
        "email": "admin@example.com"
      },
      "action": "resource.updated",
      "resource": {
        "type": "product",
        "id": "prod_456"
      },
      "changes": {
        "price": {"from": 1999, "to": 2499}
      },
      "ip_address": "203.0.113.42",
      "user_agent": "AcmeSDK/2.1.0 Python/3.11"
    }
  ],
  "has_more": true,
  "next_cursor": "log_def456"
}
```

## Filtering Logs

| Parameter | Type | Description |
|-----------|------|-------------|
| `actor_id` | string | Filter by who performed the action |
| `action` | string | Filter by action type (e.g., `resource.created`) |
| `resource_type` | string | Filter by resource type (e.g., `product`, `order`) |
| `resource_id` | string | Filter by specific resource |
| `after` | datetime | Events after this timestamp |
| `before` | datetime | Events before this timestamp |

```bash
curl "https://api.acme.com/v1/audit-logs?action=resource.deleted&after=2025-03-01T00:00:00Z" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Actor Types

| Type | Description |
|------|-------------|
| `user` | Action performed by a team member |
| `api_key` | Action performed via API key |
| `system` | Automated system action (e.g., scheduled cleanup) |
| `webhook` | Action triggered by an incoming webhook |

## Action Categories

All actions follow the pattern `{resource}.{verb}`:

- `*.created` — A resource was created
- `*.updated` — A resource was modified
- `*.deleted` — A resource was removed
- `*.accessed` — A sensitive resource was read
- `auth.login` — A user authenticated
- `auth.logout` — A user session ended
- `auth.failed` — An authentication attempt failed
- `api_key.created` — A new API key was generated
- `api_key.revoked` — An API key was revoked
- `settings.changed` — Account settings were modified

## Exporting Logs

For compliance and long-term storage, export audit logs to your own systems:

```python
import acme

client = acme.Client(api_key="YOUR_API_KEY")

# Stream all logs from the past 30 days
logs = client.audit_logs.list(
    after="2025-02-15T00:00:00Z",
    limit=100
)

for log in logs.auto_paging_iter():
    store_in_data_warehouse(log)
```

## Webhook Integration

Subscribe to the `audit_log.created` webhook event to receive audit log entries in real time:

```json
{
  "event": "audit_log.created",
  "data": {
    "id": "log_abc123",
    "action": "resource.updated",
    "timestamp": "2025-03-15T14:30:00Z"
  }
}
```
