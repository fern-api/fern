```typescript
import { SeedOauthClientCredentialsClient } from "@fern/oauth-client-credentials";

const client = new SeedOauthClientCredentialsClient({
  environment: "YOUR_BASE_URL",
  clientId: "YOUR_AUTHORIZATION",
  clientSecret: "YOUR_AUTHORIZATION",
});
await client.auth.getTokenWithClientCredentials({
  clientId: "my_oauth_app_123",
  clientSecret: "sk_live_abcdef123456789",
  scope: "read:users",
});

```


```typescript
import { SeedOauthClientCredentialsClient } from "@fern/oauth-client-credentials";

const client = new SeedOauthClientCredentialsClient({
  environment: "YOUR_BASE_URL",
  clientId: "YOUR_AUTHORIZATION",
  clientSecret: "YOUR_AUTHORIZATION",
});
await client.auth.getTokenWithClientCredentials({
  clientId: "client_id",
  clientSecret: "client_secret",
  scope: "scope",
});

```


```typescript
import { SeedOauthClientCredentialsClient } from "@fern/oauth-client-credentials";

const client = new SeedOauthClientCredentialsClient({
  environment: "YOUR_BASE_URL",
  clientId: "YOUR_AUTHORIZATION",
  clientSecret: "YOUR_AUTHORIZATION",
});
await client.auth.refreshToken({
  clientId: "my_oauth_app_123",
  clientSecret: "sk_live_abcdef123456789",
  refreshToken: "refresh_token",
  scope: "read:users",
});

```


```typescript
import { SeedOauthClientCredentialsClient } from "@fern/oauth-client-credentials";

const client = new SeedOauthClientCredentialsClient({
  environment: "YOUR_BASE_URL",
  clientId: "YOUR_AUTHORIZATION",
  clientSecret: "YOUR_AUTHORIZATION",
});
await client.auth.refreshToken({
  clientId: "client_id",
  clientSecret: "client_secret",
  refreshToken: "refresh_token",
  scope: "scope",
});

```


```typescript
import { SeedOauthClientCredentialsClient } from "@fern/oauth-client-credentials";

const client = new SeedOauthClientCredentialsClient({
  environment: "YOUR_BASE_URL",
  clientId: "YOUR_AUTHORIZATION",
  clientSecret: "YOUR_AUTHORIZATION",
});
await client.nestedNoAuth.api.getSomething();

```


```typescript
import { SeedOauthClientCredentialsClient } from "@fern/oauth-client-credentials";

const client = new SeedOauthClientCredentialsClient({
  environment: "YOUR_BASE_URL",
  clientId: "YOUR_AUTHORIZATION",
  clientSecret: "YOUR_AUTHORIZATION",
});
await client.nested.api.getSomething();

```


```typescript
import { SeedOauthClientCredentialsClient } from "@fern/oauth-client-credentials";

const client = new SeedOauthClientCredentialsClient({
  environment: "YOUR_BASE_URL",
  clientId: "YOUR_AUTHORIZATION",
  clientSecret: "YOUR_AUTHORIZATION",
});
await client.simple.getSomething();

```


