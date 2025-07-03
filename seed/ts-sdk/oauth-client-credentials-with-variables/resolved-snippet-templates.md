```typescript
import { SeedOauthClientCredentialsWithVariablesClient } from "@fern/oauth-client-credentials-with-variables";

const client = new SeedOauthClientCredentialsWithVariablesClient({
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
import { SeedOauthClientCredentialsWithVariablesClient } from "@fern/oauth-client-credentials-with-variables";

const client = new SeedOauthClientCredentialsWithVariablesClient({
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
import { SeedOauthClientCredentialsWithVariablesClient } from "@fern/oauth-client-credentials-with-variables";

const client = new SeedOauthClientCredentialsWithVariablesClient({
  environment: "YOUR_BASE_URL",
  clientId: "YOUR_AUTHORIZATION",
  clientSecret: "YOUR_AUTHORIZATION",
});
await client.service.post("endpointParam");

```


