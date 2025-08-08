# Reference
## Service
<details><summary><code>client.Service.<a href="/src/SeedContentTypes/Service/ServiceClient.cs">PatchAsync</a>(SeedContentTypes.PatchProxyRequest { ... })</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Service.PatchAsync(
    new SeedContentTypes.PatchProxyRequest { Application = "application", RequireAuth = true }
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

**request:** `SeedContentTypes.PatchProxyRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.<a href="/src/SeedContentTypes/Service/ServiceClient.cs">PatchComplexAsync</a>(id, PatchComplexRequest { ... })</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Update with JSON merge patch - complex types
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
await client.Service.PatchComplexAsync(
    "id",
    new PatchComplexRequest
    {
        Name = "name",
        Email = "email",
        Age = 1,
        Active = true,
        Metadata = new Dictionary<string, object>()
        {
            {
                "metadata",
                new Dictionary<object, object?>() { { "key", "value" } }
            },
        },
        Tags = new List<string>() { "tags", "tags" },
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

**id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `PatchComplexRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.<a href="/src/SeedContentTypes/Service/ServiceClient.cs">RegularPatchAsync</a>(id, RegularPatchRequest { ... })</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Regular PATCH endpoint without merge-patch semantics
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
await client.Service.RegularPatchAsync(
    "id",
    new RegularPatchRequest { Field1 = "field1", Field2 = 1 }
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

**id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `RegularPatchRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
