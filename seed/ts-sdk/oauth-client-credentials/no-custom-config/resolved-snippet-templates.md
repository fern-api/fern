```typescript
import { SeedOauthClientCredentialsClient } from "@fern/oauth-client-credentials";

const client = new SeedOauthClientCredentialsClient({
  environment: "YOUR_BASE_URL",
  clientId: "YOUR_AUTHORIZATION",
  clientSecret: "YOUR_AUTHORIZATION",
});
await client.auth.getTokenWithClientCredentials({
  client_id: "client_id",
  client_secret: "client_secret",
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
  client_id: "client_id",
  client_secret: "client_secret",
  refresh_token: "refresh_token",
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


