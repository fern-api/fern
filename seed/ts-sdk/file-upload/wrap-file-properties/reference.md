# Reference
## Service
<details><summary><code>client.service.<a href="/src/api/resources/service/client/Client.ts">post</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.service.post({
    file: fs.createReadStream("/path/to/your/file"),
    fileList: [fs.createReadStream("/path/to/your/file")]
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

**request:** `SeedFileUpload.MyRequest` 
    
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

<details><summary><code>client.service.<a href="/src/api/resources/service/client/Client.ts">justFile</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.service.justFile({
    file: fs.createReadStream("/path/to/your/file")
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

**request:** `SeedFileUpload.JustFileRequet` 
    
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

<details><summary><code>client.service.<a href="/src/api/resources/service/client/Client.ts">justFileWithQueryParams</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.service.justFileWithQueryParams({
    file: fs.createReadStream("/path/to/your/file"),
    maybeString: "string",
    integer: 1,
    maybeInteger: 1,
    listOfStrings: "string",
    optionalListOfStrings: "string"
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

**request:** `SeedFileUpload.JustFileWithQueryParamsRequet` 
    
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
