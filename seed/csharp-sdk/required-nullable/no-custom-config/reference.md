# Reference
## _
<details><summary><code>client._.<a href="/src/SeedApi/_/Client.cs">GetFooAsync</a>(GetFooRequest { ... }) -> WithRawResponseTask&lt;Foo&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client._.GetFooAsync(
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

<details><summary><code>client._.<a href="/src/SeedApi/_/Client.cs">UpdateFooAsync</a>(UpdateFooRequest { ... }) -> WithRawResponseTask&lt;Foo&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client._.UpdateFooAsync(
    new UpdateFooRequest { Id = "id", IdempotencyKey = "X-Idempotency-Key" }
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

**request:** `UpdateFooRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

