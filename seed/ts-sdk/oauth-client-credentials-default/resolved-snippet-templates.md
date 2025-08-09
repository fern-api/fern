```typescript
import { SeedOauthClientCredentialsDefaultClient } from "@fern/oauth-client-credentials-default";

const client = new SeedOauthClientCredentialsDefaultClient({
  environment: "YOUR_BASE_URL",
  clientId: "YOUR_AUTHORIZATION",
  clientSecret: "YOUR_AUTHORIZATION",
});
await client.auth.getToken({
  client_id: "client_id",
  client_secret: "client_secret",
});

```


```typescript
import { SeedOauthClientCredentialsDefaultClient } from "@fern/oauth-client-credentials-default";

const client = new SeedOauthClientCredentialsDefaultClient({
  environment: "YOUR_BASE_URL",
  clientId: "YOUR_AUTHORIZATION",
  clientSecret: "YOUR_AUTHORIZATION",
});
await client.nestedNoAuth.api.getSomething();

```


```typescript
import { SeedOauthClientCredentialsDefaultClient } from "@fern/oauth-client-credentials-default";

const client = new SeedOauthClientCredentialsDefaultClient({
  environment: "YOUR_BASE_URL",
  clientId: "YOUR_AUTHORIZATION",
  clientSecret: "YOUR_AUTHORIZATION",
});
await client.nested.api.getSomething();

```


```typescript
import { SeedOauthClientCredentialsDefaultClient } from "@fern/oauth-client-credentials-default";

const client = new SeedOauthClientCredentialsDefaultClient({
  environment: "YOUR_BASE_URL",
  clientId: "YOUR_AUTHORIZATION",
  clientSecret: "YOUR_AUTHORIZATION",
});
await client.simple.getSomething();

```


