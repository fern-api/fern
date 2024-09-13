```typescript
import { SeedOauthClientCredentialsEnvironmentVariablesClient } from "@fern/oauth-client-credentials-environment-variables";

const client = new SeedOauthClientCredentialsEnvironmentVariablesClient({
  environment: "YOUR_BASE_URL",
  clientId: "YOUR_AUTHORIZATION",
  clientSecret: "YOUR_AUTHORIZATION",
});
await client.auth.getTokenWithClientCredentials({
  clientId: "string",
  clientSecret: "string",
  scope: "string",
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
  clientId: "string",
  clientSecret: "string",
  refreshToken: "string",
  scope: "string",
});
 
```                        


