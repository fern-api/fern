# Reference
## Service
<details><summary><code>client.service.listResources() -> List&lt;Resource&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List resources with pagination
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.service().listResources(
    ListResourcesRequest
        .builder()
        .page(1)
        .perPage(1)
        .sort("created_at")
        .order("desc")
        .includeTotals(true)
        .fields("fields")
        .search("search")
        .build()
);
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

**page:** `Integer` — Zero-indexed page number
    
</dd>
</dl>

<dl>
<dd>

**perPage:** `Integer` — Number of items per page
    
</dd>
</dl>

<dl>
<dd>

**sort:** `String` — Sort field
    
</dd>
</dl>

<dl>
<dd>

**order:** `String` — Sort order (asc or desc)
    
</dd>
</dl>

<dl>
<dd>

**includeTotals:** `Boolean` — Whether to include total count
    
</dd>
</dl>

<dl>
<dd>

**fields:** `Optional<String>` — Comma-separated list of fields to include
    
</dd>
</dl>

<dl>
<dd>

**search:** `Optional<String>` — Search query
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.getResource(resourceId) -> Resource</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get a single resource
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.service().getResource(
    "resourceId",
    GetResourceRequest
        .builder()
        .includeMetadata(true)
        .format("json")
        .build()
);
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

**resourceId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**includeMetadata:** `Boolean` — Include metadata in response
    
</dd>
</dl>

<dl>
<dd>

**format:** `String` — Response format
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.searchResources(request) -> SearchResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Search resources with complex parameters
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.service().searchResources(
    SearchResourcesRequest
        .builder()
        .limit(1)
        .offset(1)
        .query("query")
        .filters(
            new HashMap<String, Object>() {{
                put("filters", new 
                HashMap<String, Object>() {{put("key", "value");
                }});
            }}
        )
        .build()
);
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

**limit:** `Integer` — Maximum results to return
    
</dd>
</dl>

<dl>
<dd>

**offset:** `Integer` — Offset for pagination
    
</dd>
</dl>

<dl>
<dd>

**query:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**filters:** `Optional<Map<String, Object>>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
