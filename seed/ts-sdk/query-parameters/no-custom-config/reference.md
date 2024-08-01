# Reference
## User
<details><summary><code>client.user.<a href="/src/api/resources/user/client/Client.ts">getUsername</a>({ ...params }) -> SeedQueryParameters.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.user.getUsername({
    limit: 1,
    id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    date: "2023-01-15",
    deadline: new Date("2024-01-15T09:30:00.000Z"),
    bytes: "SGVsbG8gd29ybGQh",
    user: {
        name: "string",
        tags: ["string"]
    },
    userList: [{
            name: "string",
            tags: ["string"]
        }],
    optionalDeadline: new Date("2024-01-15T09:30:00.000Z"),
    keyValue: {
        "string": "string"
    },
    optionalString: "string",
    nestedUser: {
        name: "string",
        user: {
            name: "string",
            tags: ["string"]
        }
    },
    optionalUser: {
        name: "string",
        tags: ["string"]
    },
    excludeUser: {
        name: "string",
        tags: ["string"]
    },
    filter: "string"
});

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `SeedQueryParameters.GetUsersRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `User.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
