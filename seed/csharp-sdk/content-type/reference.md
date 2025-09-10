# Reference
## Service
<details><summary><code>client.Service.<a href="/src/SeedContentTypes/Service/ServiceClient.cs">PatchAsync</a>(PatchProxyRequest { ... })</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Service.PatchAsync(
    new PatchProxyRequest { Application = "application", RequireAuth = true }
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

**request:** `PatchProxyRequest` 
    
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
    new PatchComplexRequest
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

**request:** `PatchComplexRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.<a href="/src/SeedContentTypes/Service/ServiceClient.cs">NamedPatchWithMixedAsync</a>(id, NamedMixedPatchRequest { ... })</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Named request with mixed optional/nullable fields and merge-patch content type.
This should trigger the NPE issue when optional fields aren't initialized.
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
await client.Service.NamedPatchWithMixedAsync(
    "id",
    new NamedMixedPatchRequest
    {
        AppId = "appId",
        Instructions = "instructions",
        Active = true,
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

**request:** `NamedMixedPatchRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.<a href="/src/SeedContentTypes/Service/ServiceClient.cs">OptionalMergePatchTestAsync</a>(OptionalMergePatchRequest { ... })</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Test endpoint to verify Optional field initialization and JsonSetter with Nulls.SKIP.
This endpoint should:
1. Not NPE when fields are not provided (tests initialization)
2. Not NPE when fields are explicitly null in JSON (tests Nulls.SKIP)
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
await client.Service.OptionalMergePatchTestAsync(
    new OptionalMergePatchRequest
    {
        RequiredField = "requiredField",
        OptionalString = "optionalString",
        OptionalInteger = 1,
        OptionalBoolean = true,
        NullableString = "nullableString",
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

**request:** `OptionalMergePatchRequest` 
    
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
