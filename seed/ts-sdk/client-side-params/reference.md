# Reference

## Service

<details><summary><code>client.service.<a href="/src/api/resources/service/client/Client.ts">listResources</a>({ ...params }) -> SeedClientSideParams.Resource[]</code></summary>
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

```typescript
await client.service.listResources({
    page: 1,
    per_page: 1,
    sort: "created_at",
    order: "desc",
    include_totals: true,
    fields: "fields",
    search: "search",
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

**request:** `SeedClientSideParams.ListResourcesRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Service.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client/Client.ts">getResource</a>(resourceId, { ...params }) -> SeedClientSideParams.Resource</code></summary>
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

```typescript
await client.service.getResource("resourceId", {
    include_metadata: true,
    format: "json",
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

**resourceId:** `string`

</dd>
</dl>

<dl>
<dd>

**request:** `SeedClientSideParams.GetResourceRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Service.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client/Client.ts">searchResources</a>({ ...params }) -> SeedClientSideParams.SearchResponse</code></summary>
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

```typescript
await client.service.searchResources({
    limit: 1,
    offset: 1,
    query: "query",
    filters: {
        filters: {
            key: "value",
        },
    },
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

**request:** `SeedClientSideParams.SearchResourcesRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Service.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>
