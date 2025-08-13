# Reference
## Service
<details><summary><code>client.Service.<a href="/src/SeedClientSideParams/Service/ServiceClient.cs">ListResourcesAsync</a>(ListResourcesRequest { ... }) -> IEnumerable<Resource></code></summary>
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

```csharp
await client.Service.ListResourcesAsync(
    new ListResourcesRequest
    {
        Page = 1,
        PerPage = 1,
        Sort = "created_at",
        Order = "desc",
        IncludeTotals = true,
        Fields = "fields",
        Search = "search",
    }
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

**request:** `ListResourcesRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.<a href="/src/SeedClientSideParams/Service/ServiceClient.cs">GetResourceAsync</a>(resourceId, GetResourceRequest { ... }) -> Resource</code></summary>
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

```csharp
await client.Service.GetResourceAsync(
    "resourceId",
    new GetResourceRequest { IncludeMetadata = true, Format = "json" }
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

**resourceId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `GetResourceRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.<a href="/src/SeedClientSideParams/Service/ServiceClient.cs">SearchResourcesAsync</a>(SearchResourcesRequest { ... }) -> SearchResponse</code></summary>
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

```csharp
await client.Service.SearchResourcesAsync(
    new SearchResourcesRequest
    {
        Limit = 1,
        Offset = 1,
        Query = "query",
        Filters = new Dictionary<string, object>()
        {
            {
                "filters",
                new Dictionary<object, object?>() { { "key", "value" } }
            },
        },
    }
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

**request:** `SearchResourcesRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
