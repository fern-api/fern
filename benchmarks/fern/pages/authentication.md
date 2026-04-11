---
title: Authentication
description: Learn about Square API authentication methods including OAuth 2.0 and personal access tokens.
slug: authentication
---

# Authentication

Square supports two authentication methods: personal access tokens for server-to-server calls, and OAuth 2.0 for third-party applications that need access to merchant data.

## Personal access tokens

Personal access tokens are the simplest way to authenticate. They're ideal for:

- Server-to-server API calls
- Internal tools and scripts
- Testing and development

Include your token in the `Authorization` header:

```bash
curl https://connect.squareup.com/v2/locations \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'
```

### Token security best practices

- Never expose tokens in client-side code or public repositories
- Store tokens in environment variables or a secrets manager
- Rotate tokens periodically
- Use the minimum required permissions

## OAuth 2.0

OAuth 2.0 is required when your application needs to access another merchant's Square account. The flow works as follows:

1. **Authorization request**: Redirect the merchant to Square's authorization page
2. **Authorization grant**: The merchant approves your application
3. **Token exchange**: Exchange the authorization code for an access token
4. **API access**: Use the access token to make API calls on behalf of the merchant

### Authorization URL

```
https://connect.squareup.com/oauth2/authorize?
  client_id=YOUR_APP_ID&
  scope=PAYMENTS_WRITE+ORDERS_READ&
  state=RANDOM_STATE_VALUE
```

### Token exchange

```typescript
const response = await client.oAuth.obtainToken({
  clientId: process.env.SQUARE_APP_ID,
  clientSecret: process.env.SQUARE_APP_SECRET,
  grantType: "authorization_code",
  code: authorizationCode,
});

const accessToken = response.result.accessToken;
const refreshToken = response.result.refreshToken;
```

### Refreshing tokens

Access tokens expire after 30 days. Use the refresh token to obtain a new access token:

```typescript
const response = await client.oAuth.obtainToken({
  clientId: process.env.SQUARE_APP_ID,
  clientSecret: process.env.SQUARE_APP_SECRET,
  grantType: "refresh_token",
  refreshToken: savedRefreshToken,
});
```

## OAuth scopes

Request only the scopes your application needs:

| Scope | Description |
|-------|-------------|
| `PAYMENTS_READ` | View payment information |
| `PAYMENTS_WRITE` | Process payments |
| `ORDERS_READ` | View orders |
| `ORDERS_WRITE` | Create and update orders |
| `CUSTOMERS_READ` | View customer profiles |
| `CUSTOMERS_WRITE` | Create and update customers |
| `ITEMS_READ` | View catalog items |
| `ITEMS_WRITE` | Create and update catalog items |
| `MERCHANT_PROFILE_READ` | View merchant profile |
| `EMPLOYEES_READ` | View team member information |
| `INVENTORY_READ` | View inventory counts |
| `INVENTORY_WRITE` | Adjust inventory counts |

## Webhook authentication

Square signs webhook notifications with an HMAC-SHA256 signature. Verify the signature before processing:

```typescript
import crypto from "crypto";

function verifyWebhookSignature(
  body: string,
  signature: string,
  signatureKey: string,
  notificationUrl: string
): boolean {
  const combined = notificationUrl + body;
  const expectedSignature = crypto
    .createHmac("sha256", signatureKey)
    .update(combined)
    .digest("base64");

  return signature === expectedSignature;
}
```
