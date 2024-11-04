# Reference
## DataService
<details><summary><code>client.Dataservice.<a href="/src/SeedApi/Dataservice/DataserviceClient.cs">FooAsync</a>() -> object</code></summary>
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

<details><summary><code>client.Dataservice.<a href="/src/SeedApi/Dataservice/DataserviceClient.cs">UploadAsync</a>(UploadRequest { ... }) -> UploadResponse</code></summary>
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
        Columns = new List<Column>()
        {
            new Column
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

<details><summary><code>client.Dataservice.<a href="/src/SeedApi/Dataservice/DataserviceClient.cs">DeleteAsync</a>(DeleteRequest { ... }) -> DeleteResponse</code></summary>
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

<details><summary><code>client.Dataservice.<a href="/src/SeedApi/Dataservice/DataserviceClient.cs">DescribeAsync</a>(DescribeRequest { ... }) -> DescribeResponse</code></summary>
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

<details><summary><code>client.Dataservice.<a href="/src/SeedApi/Dataservice/DataserviceClient.cs">FetchAsync</a>(FetchRequest { ... }) -> FetchResponse</code></summary>
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

<details><summary><code>client.Dataservice.<a href="/src/SeedApi/Dataservice/DataserviceClient.cs">ListAsync</a>(ListRequest { ... }) -> ListResponse</code></summary>
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

<details><summary><code>client.Dataservice.<a href="/src/SeedApi/Dataservice/DataserviceClient.cs">QueryAsync</a>(QueryRequest { ... }) -> QueryResponse</code></summary>
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

<details><summary><code>client.Dataservice.<a href="/src/SeedApi/Dataservice/DataserviceClient.cs">UpdateAsync</a>(UpdateRequest { ... }) -> UpdateResponse</code></summary>
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
