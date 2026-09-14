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
            createdAt: "2024-01-15T09:30:00Z"
        }
    },
    optionalMetadata: {
        "optionalMetadata": {
            displayName: "displayName",
            createdAt: "2024-01-15T09:30:00Z"
        }
    },
    timestamps: {
        "timestamps": "2024-01-15T09:30:00Z"
    },
    nested: {
        "nested": {
            "nested": {
                displayName: "displayName",
                createdAt: "2024-01-15T09:30:00Z"
            }
        }
    },
    grouped: {
        "grouped": [{
                displayName: "displayName",
                createdAt: "2024-01-15T09:30:00Z"
            }, {
                displayName: "displayName",
                createdAt: "2024-01-15T09:30:00Z"
            }]
    },
    setValues: {
        "setValues": ["setValues"]
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

