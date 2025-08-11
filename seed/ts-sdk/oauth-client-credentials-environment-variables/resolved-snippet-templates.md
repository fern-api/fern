```typescript
import { SeedOauthClientCredentialsEnvironmentVariablesClient } from "@fern/oauth-client-credentials-environment-variables";

const client = new SeedOauthClientCredentialsEnvironmentVariablesClient({
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
import { SeedOauthClientCredentialsEnvironmentVariablesClient } from "@fern/oauth-client-credentials-environment-variables";

const client = new SeedOauthClientCredentialsEnvironmentVariablesClient({
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
import { SeedOauthClientCredentialsEnvironmentVariablesClient } from "@fern/oauth-client-credentials-environment-variables";

const client = new SeedOauthClientCredentialsEnvironmentVariablesClient({
  environment: "YOUR_BASE_URL",
  clientId: "YOUR_AUTHORIZATION",
  clientSecret: "YOUR_AUTHORIZATION",
});
await client.nestedNoAuth.api.getSomething();

```


```typescript
import { SeedOauthClientCredentialsEnvironmentVariablesClient } from "@fern/oauth-client-credentials-environment-variables";

const client = new SeedOauthClientCredentialsEnvironmentVariablesClient({
  environment: "YOUR_BASE_URL",
  clientId: "YOUR_AUTHORIZATION",
  clientSecret: "YOUR_AUTHORIZATION",
});
await client.nested.api.getSomething();

```


```typescript
import { SeedOauthClientCredentialsEnvironmentVariablesClient } from "@fern/oauth-client-credentials-environment-variables";

const client = new SeedOauthClientCredentialsEnvironmentVariablesClient({
  environment: "YOUR_BASE_URL",
  clientId: "YOUR_AUTHORIZATION",
  clientSecret: "YOUR_AUTHORIZATION",
});
await client.simple.getSomething();

```


