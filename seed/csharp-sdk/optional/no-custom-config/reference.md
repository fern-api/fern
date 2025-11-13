# Reference
## Optional
<details><summary><code>client.Optional.<a href="/src/SeedObjectsWithImports/Optional/OptionalClient.cs">SendOptionalBodyAsync</a>(Dictionary<string, object?>? { ... }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Optional.SendOptionalBodyAsync(
    new Dictionary<string, object?>()
    {
        {
            "string",
            new Dictionary<object, object?>() { { "key", "value" } }
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

**request:** `Dictionary<string, object?>?` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Optional.<a href="/src/SeedObjectsWithImports/Optional/OptionalClient.cs">SendOptionalTypedBodyAsync</a>(SendOptionalBodyRequest? { ... }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Optional.SendOptionalTypedBodyAsync(
    new SendOptionalBodyRequest { Message = "message" }
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

**request:** `SendOptionalBodyRequest?` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Optional.<a href="/src/SeedObjectsWithImports/Optional/OptionalClient.cs">SendOptionalNullableWithAllOptionalPropertiesAsync</a>(actionId, id, DeployParams? { ... }) -> DeployResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Tests optional(nullable(T)) where T has only optional properties.
This should not generate wire tests expecting {} when Optional.empty() is passed.
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
await client.Optional.SendOptionalNullableWithAllOptionalPropertiesAsync(
    "actionId",
    "id",
    new DeployParams { UpdateDraft = true }
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

**actionId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `DeployParams?` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
