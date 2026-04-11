---
title: Access Control
slug: access-control
description: Manage permissions with roles and scoped API keys.
---

# Access Control

The Acme API provides fine-grained access control through roles, scoped API keys, and resource-level permissions.

## API Key Scopes

When creating an API key, assign scopes that limit what the key can access. This follows the principle of least privilege.

```bash
curl -X POST https://api.acme.com/v1/api-keys \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Order Processing Service",
    "scopes": ["orders:read", "orders:write", "products:read"],
    "expires_at": "2026-01-01T00:00:00Z"
  }'
```

### Available Scopes

| Scope | Description |
|-------|-------------|
| `orders:read` | Read order data |
| `orders:write` | Create and modify orders |
| `products:read` | Read product catalog |
| `products:write` | Modify product catalog |
| `customers:read` | Read customer profiles |
| `customers:write` | Modify customer data |
| `analytics:read` | Access analytics and reports |
| `settings:read` | Read account settings |
| `settings:write` | Modify account settings |
| `webhooks:manage` | Create and manage webhooks |
| `api_keys:manage` | Create and revoke API keys |

## Roles

Assign roles to team members to control dashboard and API access.

### Built-in Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| Owner | Full account access | All permissions |
| Admin | Manage team and settings | All except billing |
| Developer | API access and integration | Read/write resources |
| Analyst | Read-only data access | Read resources + analytics |
| Support | Customer-facing operations | Read resources + limited write |

### Custom Roles

Create custom roles tailored to your organization's needs:

```bash
curl -X POST https://api.acme.com/v1/roles \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Inventory Manager",
    "permissions": [
      "products:read",
      "products:write",
      "orders:read"
    ]
  }'
```

## Resource-Level Permissions

For multi-tenant applications, restrict API key access to specific resources:

```python
import acme

client = acme.Client(api_key="YOUR_API_KEY")

# Create a key restricted to a specific store
key = client.api_keys.create(
    name="Store #42 POS",
    scopes=["orders:read", "orders:write"],
    resource_restrictions=[
        {"type": "store", "id": "store_42"}
    ],
    expires_at="2026-01-01T00:00:00Z"
)
```

## IP Allowlisting

Restrict API key usage to specific IP addresses or CIDR ranges:

```bash
curl -X PATCH https://api.acme.com/v1/api-keys/key_abc123 \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "allowed_ips": ["203.0.113.0/24", "198.51.100.42"]
  }'
```

Requests from non-allowed IPs receive a `403 Forbidden` response.

## Checking Permissions

Use the permissions endpoint to verify what a given API key can access:

```bash
curl https://api.acme.com/v1/auth/permissions \
  -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "scopes": ["orders:read", "orders:write", "products:read"],
  "restrictions": {
    "stores": ["store_42"]
  },
  "expires_at": "2026-01-01T00:00:00Z"
}
```
