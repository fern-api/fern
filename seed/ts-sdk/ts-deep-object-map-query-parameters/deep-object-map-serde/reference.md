# Reference
## Search
<details><summary><code>client.search.<a href="/src/api/resources/search/client/Client.ts">search</a>({ ...params }) -> SeedTsDeepObjectMapQueryParameters.SearchResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.search.search({
    labels: {
        "labels": "labels"
    },
    metadata: {
        "metadata": {
            displayName: "displayName",
            createdAt: new Date("2024-01-15T09:30:00.000Z")
        }
    },
    optionalMetadata: {
        "optionalMetadata": {
            displayName: "displayName",
            createdAt: new Date("2024-01-15T09:30:00.000Z")
        }
    },
    timestamps: {
        "timestamps": new Date("2024-01-15T09:30:00.000Z")
    },
    nested: {
        "nested": {
            "nested": {
                displayName: "displayName",
                createdAt: new Date("2024-01-15T09:30:00.000Z")
            }
        }
    },
    grouped: {
        "grouped": [{
                displayName: "displayName",
                createdAt: new Date("2024-01-15T09:30:00.000Z")
            }, {
                displayName: "displayName",
                createdAt: new Date("2024-01-15T09:30:00.000Z")
            }]
    },
    setValues: {
        "setValues": new Set(["setValues"])
    },
    colors: {
        "colors": "red"
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

**request:** `SeedTsDeepObjectMapQueryParameters.SearchRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `SearchClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

