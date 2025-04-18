```typescript
import { SeedNullableClient } from "@fern/nullable";

const client = new SeedNullableClient({ environment: "YOUR_BASE_URL" });
await client.nullable.getUsers({
  usernames: "usernames",
  avatar: "avatar",
  activated: true,
  tags: "tags",
  extra: true,
});

```


```typescript
import { SeedNullableClient } from "@fern/nullable";

const client = new SeedNullableClient({ environment: "YOUR_BASE_URL" });        
await client.nullable.createUser(
	{
		username: "username",
		tags: [
			"tags",
			"tags"
		],
		metadata: {
			createdAt: "2024-01-15T09:30:00Z",
			updatedAt: "2024-01-15T09:30:00Z",
			avatar: "avatar",
			activated: true,
			status: status: { type : "active" },
			values: {
				"values": "values"
			}
		},
		avatar: "avatar"
	}
)

```


```typescript
import { SeedNullableClient } from "@fern/nullable";

const client = new SeedNullableClient({ environment: "YOUR_BASE_URL" });
await client.nullable.deleteUser({
  username: "xy",
});

```


