# Reference
## Service
<details><summary><code>client.service.<a href="/src/api/resources/service/client/Client.ts">post</a>(file, fileList, maybeFile, maybeFileList, { ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.service.post(fs.createReadStream("/path/to/your/file"), [fs.createReadStream("/path/to/your/file")], fs.createReadStream("/path/to/your/file"), [fs.createReadStream("/path/to/your/file")], {});

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

**file:** `File | fs.ReadStream | Blob` 
    
</dd>
</dl>

<dl>
<dd>

**fileList:** `File[] | fs.ReadStream[] | Blob[]` 
    
</dd>
</dl>

<dl>
<dd>

**maybeFile:** `File | fs.ReadStream | Blob | undefined` 
    
</dd>
</dl>

<dl>
<dd>

**maybeFileList:** `File[] | fs.ReadStream[] | Blob[] | undefined` 
    
</dd>
</dl>

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

<details><summary><code>client.service.<a href="/src/api/resources/service/client/Client.ts">justFile</a>(file) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.service.justFile(fs.createReadStream("/path/to/your/file"));

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

**file:** `File | fs.ReadStream | Blob` 
    
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

<details><summary><code>client.service.<a href="/src/api/resources/service/client/Client.ts">justFileWithQueryParams</a>(file, { ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.service.justFileWithQueryParams(fs.createReadStream("/path/to/your/file"), {
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

**file:** `File | fs.ReadStream | Blob` 
    
</dd>
</dl>

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
