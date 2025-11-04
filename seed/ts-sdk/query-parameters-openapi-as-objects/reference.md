# Reference
<details><summary><code>client.<a href="/src/Client.ts">search</a>({ ...params }) -> SeedApi.SearchResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.search({
    limit: 1,
    id: "id",
    date: "date",
    deadline: "2024-01-15T09:30:00Z",
    bytes: "bytes",
    user: {
        name: "name",
        tags: ["tags", "tags"]
    },
    userList: {
        name: "name",
        tags: ["tags", "tags"]
    },
    optionalDeadline: "2024-01-15T09:30:00Z",
    keyValue: {
        "keyValue": "keyValue"
    },
    optionalString: "optionalString",
    nestedUser: {
        name: "name",
        user: {
            name: "name",
            tags: ["tags", "tags"]
        }
    },
    optionalUser: {
        name: "name",
        tags: ["tags", "tags"]
    },
    excludeUser: {
        name: "name",
        tags: ["tags", "tags"]
    },
    filter: "filter",
    neighbor: {
        name: "name",
        tags: ["tags", "tags"]
    },
    neighborRequired: {
        name: "name",
        tags: ["tags", "tags"]
    }
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

**request:** `SearchRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `SeedApiClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## 