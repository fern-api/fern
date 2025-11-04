# Reference
## Service
<details><summary><code>client.service.<a href="/src/api/resources/service/client/Client.ts">getResource</a>(resourceId) -> SeedMixedCase.Resource</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.service.getResource("rsc-xyz");

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

**requestOptions:** `Service.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client/Client.ts">listResources</a>({ ...params }) -> SeedMixedCase.Resource[]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.service.listResources({
    page_limit: 10,
    beforeDate: "2023-01-01"
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

**request:** `ListResourcesRequest` 
    
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
