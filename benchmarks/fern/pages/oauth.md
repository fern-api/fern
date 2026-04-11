---
title: OAuth 2.0
slug: oauth
description: Integrate with the Acme API using OAuth 2.0 for third-party applications.
---

# OAuth 2.0

The Acme API supports OAuth 2.0 for third-party applications that need to access user data on behalf of Acme customers. This is the recommended authentication method for marketplace apps and integrations.

## Authorization Flow

### Step 1: Redirect to Authorization

Direct the user to the Acme authorization page:

```
https://auth.acme.com/oauth/authorize?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=https://yourapp.com/callback&
  response_type=code&
  scope=orders:read products:read&
  state=random_csrf_token
```

### Step 2: Handle the Callback

After the user approves, Acme redirects to your `redirect_uri` with an authorization code:

```
https://yourapp.com/callback?code=AUTH_CODE&state=random_csrf_token
```

### Step 3: Exchange Code for Tokens

```bash
curl -X POST https://auth.acme.com/oauth/token \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "authorization_code",
    "code": "AUTH_CODE",
    "client_id": "YOUR_CLIENT_ID",
    "client_secret": "YOUR_CLIENT_SECRET",
    "redirect_uri": "https://yourapp.com/callback"
  }'
```

### Response

```json
{
  "access_token": "at_live_abc123",
  "refresh_token": "rt_live_xyz789",
  "token_type": "bearer",
  "expires_in": 3600,
  "scope": "orders:read products:read",
  "merchant_id": "merchant_456"
}
```

## Refreshing Tokens

Access tokens expire after 1 hour. Use the refresh token to obtain a new access token:

```bash
curl -X POST https://auth.acme.com/oauth/token \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "refresh_token",
    "refresh_token": "rt_live_xyz789",
    "client_id": "YOUR_CLIENT_ID",
    "client_secret": "YOUR_CLIENT_SECRET"
  }'
```

Refresh tokens are valid for 30 days and are rotated on each use — the response includes a new refresh token.

## Scopes

| Scope | Description |
|-------|-------------|
| `orders:read` | View orders |
| `orders:write` | Create and modify orders |
| `products:read` | View product catalog |
| `products:write` | Manage products |
| `customers:read` | View customer data |
| `payments:read` | View payment history |
| `payments:write` | Process payments |
| `webhooks:manage` | Manage webhook subscriptions |

Request only the scopes your application needs. Users see the requested scopes on the authorization page and may deny access if the scopes seem excessive.

## Revoking Access

Users can revoke access from their Acme dashboard. You can also programmatically revoke tokens:

```bash
curl -X POST https://auth.acme.com/oauth/revoke \
  -H "Content-Type: application/json" \
  -d '{
    "token": "at_live_abc123",
    "client_id": "YOUR_CLIENT_ID",
    "client_secret": "YOUR_CLIENT_SECRET"
  }'
```

## SDK Integration

```python
import acme
from acme.oauth import OAuthClient

oauth = OAuthClient(
    client_id="YOUR_CLIENT_ID",
    client_secret="YOUR_CLIENT_SECRET"
)

# Generate authorization URL
auth_url = oauth.authorization_url(
    redirect_uri="https://yourapp.com/callback",
    scopes=["orders:read", "products:read"],
    state="csrf_token"
)

# Exchange code for tokens
tokens = oauth.exchange_code(
    code="AUTH_CODE",
    redirect_uri="https://yourapp.com/callback"
)

# Create an authenticated client
client = acme.Client(access_token=tokens.access_token)
orders = client.orders.list()
```

## Security Best Practices

1. Always validate the `state` parameter to prevent CSRF attacks
2. Store client secrets securely — never expose them in client-side code
3. Use PKCE (Proof Key for Code Exchange) for mobile and single-page applications
4. Implement token refresh logic to handle expired access tokens gracefully
5. Request minimal scopes needed for your integration
