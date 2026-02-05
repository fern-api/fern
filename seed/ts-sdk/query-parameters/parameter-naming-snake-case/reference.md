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
    deadline: "2024-01-15T09:30:00Z",
    bytes: "SGVsbG8gd29ybGQh",
    user: {
        name: "name",
        tags: ["tags", "tags"]
    },
    user_list: [{
            name: "name",
            tags: ["tags", "tags"]
        }, {
            name: "name",
            tags: ["tags", "tags"]
        }],
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

**request:** `SeedQueryParameters.GetUsersRequest` 
    
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
