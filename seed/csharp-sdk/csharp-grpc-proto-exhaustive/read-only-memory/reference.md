# Reference
<details><summary><code>client.<a href="/src/SeedApi/SeedApiClient.cs">PostFooAsync</a>() -> WithRawResponseTask&lt;Dictionary&lt;string, object?&gt;&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.PostFooAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## DataService
<details><summary><code>client.DataService.<a href="/src/SeedApi/DataService/DataServiceClient.cs">CheckAsync</a>() -> WithRawResponseTask&lt;CheckResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.DataService.CheckAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.DataService.<a href="/src/SeedApi/DataService/DataServiceClient.cs">CreateAsync</a>(CreateRequest { ... }) -> WithRawResponseTask&lt;CreateResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.DataService.CreateAsync(new CreateRequest { Name = "name" });
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

**request:** `CreateRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.DataService.<a href="/src/SeedApi/DataService/DataServiceClient.cs">DeleteAsync</a>(DeleteRequest { ... }) -> WithRawResponseTask&lt;DeleteResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.DataService.DeleteAsync(new DeleteRequest());
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

**request:** `DeleteRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.DataService.<a href="/src/SeedApi/DataService/DataServiceClient.cs">DescribeAsync</a>(DescribeRequest { ... }) -> WithRawResponseTask&lt;DescribeResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.DataService.DescribeAsync(new DescribeRequest());
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

**request:** `DescribeRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.DataService.<a href="/src/SeedApi/DataService/DataServiceClient.cs">QueryAsync</a>(QueryRequest { ... }) -> WithRawResponseTask&lt;QueryResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.DataService.QueryAsync(new QueryRequest { TopK = 1 });
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

**request:** `QueryRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.DataService.<a href="/src/SeedApi/DataService/DataServiceClient.cs">UploadAsync</a>(UploadRequest { ... }) -> WithRawResponseTask&lt;UploadResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.DataService.UploadAsync(
    new UploadRequest
    {
        Columns = new List<SeedApi.Column>()
        {
            new SeedApi.Column { Id = "id", Values = new[] { 1.1f } },
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

**request:** `UploadRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.DataService.<a href="/src/SeedApi/DataService/DataServiceClient.cs">FetchAsync</a>(FetchRequest { ... }) -> WithRawResponseTask&lt;FetchResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.DataService.FetchAsync(new FetchRequest());
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

**request:** `FetchRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.DataService.<a href="/src/SeedApi/DataService/DataServiceClient.cs">ListAsync</a>(ListRequest { ... }) -> WithRawResponseTask&lt;ListResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.DataService.ListAsync(new ListRequest());
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

**request:** `ListRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.DataService.<a href="/src/SeedApi/DataService/DataServiceClient.cs">UpdateAsync</a>(UpdateRequest { ... }) -> WithRawResponseTask&lt;UpdateResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.DataService.UpdateAsync(new UpdateRequest { Id = "id" });
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

**request:** `UpdateRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

