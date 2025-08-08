# Reference
<details><summary><code>client.<a href="/src/SeedValidation/SeedValidationClient.cs">CreateAsync</a>(SeedValidation.CreateRequest { ... }) -> SeedValidation.Type</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.CreateAsync(
    new SeedValidation.CreateRequest
    {
        Decimal = 2.2,
        Even = 100,
        Name = "fern",
        Shape = SeedValidation.Shape.Square,
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

**request:** `SeedValidation.CreateRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/src/SeedValidation/SeedValidationClient.cs">GetAsync</a>(SeedValidation.GetRequest { ... }) -> SeedValidation.Type</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.GetAsync(
    new SeedValidation.GetRequest
    {
        Decimal = 2.2,
        Even = 100,
        Name = "fern",
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

**request:** `SeedValidation.GetRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
