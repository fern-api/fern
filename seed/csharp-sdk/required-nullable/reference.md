# Reference
<details><summary><code>client.<a href="/src/SeedApi/SeedApiClient.cs">GetFooAsync</a>(GetFooRequest { ... }) -> Foo</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.GetFooAsync(
    new GetFooRequest
    {
        RequiredBaz = "required_baz",
        RequiredNullableBaz = "required_nullable_baz",
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

**request:** `GetFooRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/src/SeedApi/SeedApiClient.cs">UpdateFooAsync</a>(id, UpdateFooRequest { ... }) -> Foo</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.UpdateFooAsync(
    "id",
    new UpdateFooRequest
    {
        XIdempotencyKey = "X-Idempotency-Key",
        NullableText = "nullable_text",
        NullableNumber = 1.1,
        NonNullableText = "non_nullable_text",
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

**request:** `UpdateFooRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
