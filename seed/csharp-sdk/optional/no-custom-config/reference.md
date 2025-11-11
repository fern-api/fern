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
