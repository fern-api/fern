```typescript
import { SeedOauthClientCredentialsEnvironmentVariablesClient } from "@fern/oauth-client-credentials-environment-variables";

const client = new SeedOauthClientCredentialsEnvironmentVariablesClient({
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
import { SeedOauthClientCredentialsEnvironmentVariablesClient } from "@fern/oauth-client-credentials-environment-variables";

const client = new SeedOauthClientCredentialsEnvironmentVariablesClient({
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


