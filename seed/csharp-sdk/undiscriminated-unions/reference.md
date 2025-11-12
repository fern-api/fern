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

<details><summary><code>client.Union.<a href="/src/SeedUndiscriminatedUnions/Union/UnionClient.cs">UpdateMetadataAsync</a>(OneOf<Dictionary<string, object?>?, NamedMetadata> { ... }) -> bool</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Union.UpdateMetadataAsync(
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

**request:** `OneOf<Dictionary<string, object?>?, NamedMetadata>` 
    
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
        Union = new Dictionary<string, object?>()
        {
            {
                "string",
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

<details><summary><code>client.Union.<a href="/src/SeedUndiscriminatedUnions/Union/UnionClient.cs">DuplicateTypesUnionAsync</a>(OneOf<string, IEnumerable<string>, int, HashSet<string>> { ... }) -> OneOf<string, IEnumerable<string>, int, HashSet<string>></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Union.DuplicateTypesUnionAsync("string");
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

**request:** `OneOf<string, IEnumerable<string>, int, HashSet<string>>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Union.<a href="/src/SeedUndiscriminatedUnions/Union/UnionClient.cs">NestedUnionsAsync</a>(OneOf<string, IEnumerable<string>, OneOf<int, HashSet<string>, IEnumerable<string>, OneOf<bool, HashSet<string>, IEnumerable<string>>>> { ... }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Union.NestedUnionsAsync("string");
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

**request:** `OneOf<string, IEnumerable<string>, OneOf<int, HashSet<string>, IEnumerable<string>, OneOf<bool, HashSet<string>, IEnumerable<string>>>>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Union.<a href="/src/SeedUndiscriminatedUnions/Union/UnionClient.cs">TestCamelCasePropertiesAsync</a>(PaymentRequest { ... }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Union.TestCamelCasePropertiesAsync(
    new PaymentRequest
    {
        PaymentMethod = new ConvertToken { Method = "card", TokenId = "tok_123" },
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

**request:** `PaymentRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
