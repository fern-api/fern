```typescript
import { SeedWebsocketAuthClient } from "@fern/websocket-inferred-auth";

const client = new SeedWebsocketAuthClient({ environment: "YOUR_BASE_URL" });        
await client.auth.getTokenWithClientCredentials(
	{
		X-Api-Key: "X-Api-Key",
		client_id: "client_id",
		client_secret: "client_secret",
		scope: "scope"
	}
)

```


```typescript
import { SeedWebsocketAuthClient } from "@fern/websocket-inferred-auth";

const client = new SeedWebsocketAuthClient({ environment: "YOUR_BASE_URL" });        
await client.auth.refreshToken(
	{
		X-Api-Key: "X-Api-Key",
		client_id: "client_id",
		client_secret: "client_secret",
		refresh_token: "refresh_token",
		scope: "scope"
	}
)

```


