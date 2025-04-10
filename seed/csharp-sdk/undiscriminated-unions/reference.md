# Reference
## Union
<details><summary><code>client.Union.<a href="/src/SeedUndiscriminatedUnions/Union/UnionClient.cs">GetAsync</a>(OneOf<string, IEnumerable<string>, int, IEnumerable<int>, IEnumerable<IEnumerable<int>>, HashSet<string>> { ... }) -> OneOf<string, IEnumerable<string>, int, IEnumerable<int>, IEnumerable<IEnumerable<int>>, HashSet<string>></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Union.GetAsync("string");
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

**request:** `OneOf<string, IEnumerable<string>, int, IEnumerable<int>, IEnumerable<IEnumerable<int>>, HashSet<string>>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Union.<a href="/src/SeedUndiscriminatedUnions/Union/UnionClient.cs">GetMetadataAsync</a>() -> Dictionary<OneOf<KeyType, string>, string></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Union.GetMetadataAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Union.<a href="/src/SeedUndiscriminatedUnions/Union/UnionClient.cs">UpdateMetadataAsync</a>(OneOf<object?, NamedMetadata> { ... }) -> bool</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Union.UpdateMetadataAsync(
    new Dictionary<string, object>()
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

**request:** `OneOf<object?, NamedMetadata>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Union.<a href="/src/SeedUndiscriminatedUnions/Union/UnionClient.cs">CallAsync</a>(Request { ... }) -> bool</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Union.CallAsync(
    new Request
    {
        Union = new Dictionary<string, object>()
        {
            {
                "union",
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

**request:** `Request` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
