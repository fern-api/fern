# Reference
## User
<details><summary><code>client.user.<a href="/src/api/resources/user/client/Client.ts">getusername</a>({ ...params }) -> SeedApi.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.user.getusername({
    limit: 1,
    id: "id",
    date: "2023-01-15",
    deadline: "2024-01-15T09:30:00Z",
    bytes: "bytes",
    user: {
        name: "name",
        tags: ["tags", "tags"]
    },
    user_list: {
        name: "name",
        tags: ["tags", "tags"]
    },
    optional_deadline: "2024-01-15T09:30:00Z",
    key_value: {
        "keyValue": "keyValue"
    },
    optional_string: "optionalString",
    nested_user: {
        name: "name",
        user: {
            name: "name",
            tags: ["tags", "tags"]
        }
    },
    optional_user: {
        name: "name",
        tags: ["tags", "tags"]
    },
    exclude_user: {
        name: "name",
        tags: ["tags", "tags"]
    },
    filter: "filter"
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

**request:** `SeedApi.UserGetUsernameRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UserClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

