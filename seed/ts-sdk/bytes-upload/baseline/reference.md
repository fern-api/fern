# Reference
## Service
<details><summary><code>client.service.<a href="/src/api/resources/service/client/Client.ts">upload</a>(uploadable) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.service.upload(createReadStream("path/to/file"));

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

**uploadable:** `core.file.Uploadable` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client/Client.ts">uploadWithQueryParams</a>(uploadable, { ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.service.uploadWithQueryParams(createReadStream("path/to/file"), {
    model: "nova-2"
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

**uploadable:** `core.file.Uploadable` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedBytesUpload.UploadWithQueryParamsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

