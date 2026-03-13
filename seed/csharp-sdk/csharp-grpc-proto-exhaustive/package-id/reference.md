# Reference
## DataService
<details><summary><code>client.Dataservice.<a href="/src/SeedApi/Dataservice/DataserviceClient.cs">FooAsync</a>() -> WithRawResponseTask&lt;Dictionary&lt;string, object?&gt;&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Dataservice.FooAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Dataservice.<a href="/src/SeedApi/Dataservice/DataserviceClient.cs">UploadAsync</a>(UploadRequest { ... }) -> WithRawResponseTask&lt;UploadResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Dataservice.UploadAsync(
    new UploadRequest
    {
        Columns = new List<SeedApi.Column>()
        {
            new SeedApi.Column
            {
                Id = "id",
                Values = new List<float>() { 1.1f },
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

**request:** `UploadRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Dataservice.<a href="/src/SeedApi/Dataservice/DataserviceClient.cs">DeleteAsync</a>(DeleteRequest { ... }) -> WithRawResponseTask&lt;DeleteResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Dataservice.DeleteAsync(new DeleteRequest());
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

<details><summary><code>client.Dataservice.<a href="/src/SeedApi/Dataservice/DataserviceClient.cs">DescribeAsync</a>(DescribeRequest { ... }) -> WithRawResponseTask&lt;DescribeResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Dataservice.DescribeAsync(new DescribeRequest());
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

<details><summary><code>client.Dataservice.<a href="/src/SeedApi/Dataservice/DataserviceClient.cs">FetchAsync</a>(FetchRequest { ... }) -> WithRawResponseTask&lt;FetchResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Dataservice.FetchAsync(new FetchRequest());
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

<details><summary><code>client.Dataservice.<a href="/src/SeedApi/Dataservice/DataserviceClient.cs">ListAsync</a>(ListRequest { ... }) -> WithRawResponseTask&lt;ListResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Dataservice.ListAsync(new ListRequest());
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

<details><summary><code>client.Dataservice.<a href="/src/SeedApi/Dataservice/DataserviceClient.cs">QueryAsync</a>(QueryRequest { ... }) -> WithRawResponseTask&lt;QueryResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Dataservice.QueryAsync(new QueryRequest { TopK = 1 });
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

<details><summary><code>client.Dataservice.<a href="/src/SeedApi/Dataservice/DataserviceClient.cs">UpdateAsync</a>(UpdateRequest { ... }) -> WithRawResponseTask&lt;UpdateResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Dataservice.UpdateAsync(new UpdateRequest { Id = "id" });
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

