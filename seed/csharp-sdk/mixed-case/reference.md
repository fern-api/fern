# Reference
## Service
<details><summary><code>client.Service.<a href="/src/SeedApi/Service/ServiceClient.cs">GetresourceAsync</a>(ServiceGetResourceRequest { ... }) -> WithRawResponseTask&lt;OneOf&lt;ResourceZero, ResourceOne&gt;&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Service.GetresourceAsync(new ServiceGetResourceRequest { ResourceId = "ResourceID" });
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

**request:** `ServiceGetResourceRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.<a href="/src/SeedApi/Service/ServiceClient.cs">ListresourcesAsync</a>(ServiceListResourcesRequest { ... }) -> WithRawResponseTask&lt;IEnumerable&lt;OneOf&lt;ResourceZero, ResourceOne&gt;&gt;&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Service.ListresourcesAsync(
    new ServiceListResourcesRequest { PageLimit = 1, BeforeDate = new DateOnly(2023, 1, 15) }
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

**request:** `ServiceListResourcesRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

