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

<details><summary><code>client.Service.<a href="/src/SeedContentTypes/Service/ServiceClient.cs">PatchComplexAsync</a>(id, SeedContentTypes.PatchComplexRequest { ... })</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Update with JSON merge patch - complex types.
This endpoint demonstrates the distinction between:
- optional<T> fields (can be present or absent, but not null)
- optional<nullable<T>> fields (can be present, absent, or null)
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
    new SeedContentTypes.PatchComplexRequest
    {
        Name = "name",
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
        Email = "email",
        Nickname = "nickname",
        Bio = "bio",
        ProfileImageUrl = "profileImageUrl",
        Settings = new Dictionary<string, object>()
        {
            {
                "settings",
                new Dictionary<object, object?>() { { "key", "value" } }
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

**id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedContentTypes.PatchComplexRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.<a href="/src/SeedContentTypes/Service/ServiceClient.cs">RegularPatchAsync</a>(id, SeedContentTypes.RegularPatchRequest { ... })</code></summary>
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
    new SeedContentTypes.RegularPatchRequest { Field1 = "field1", Field2 = 1 }
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

**request:** `SeedContentTypes.RegularPatchRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
