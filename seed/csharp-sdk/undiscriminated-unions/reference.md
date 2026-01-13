# Reference
## Union
<details><summary><code>client.Union.<a href="/src/SeedUndiscriminatedUnions/Union/UnionClient.cs">GetAsync</a>(OneOf&lt;string, IEnumerable&lt;string&gt;, int, IEnumerable&lt;int&gt;, IEnumerable&lt;IEnumerable&lt;int&gt;&gt;, HashSet&lt;string&gt;&gt; { ... }) -> OneOf&lt;string, IEnumerable&lt;string&gt;, int, IEnumerable&lt;int&gt;, IEnumerable&lt;IEnumerable&lt;int&gt;&gt;, HashSet&lt;string&gt;&gt;</code></summary>
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

<details><summary><code>client.Union.<a href="/src/SeedUndiscriminatedUnions/Union/UnionClient.cs">GetMetadataAsync</a>() -> Dictionary&lt;OneOf&lt;KeyType, string&gt;, string&gt;</code></summary>
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

<details><summary><code>client.Union.<a href="/src/SeedUndiscriminatedUnions/Union/UnionClient.cs">UpdateMetadataAsync</a>(OneOf&lt;Dictionary&lt;string, object?&gt;?, NamedMetadata&gt; { ... }) -> bool</code></summary>
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

<details><summary><code>client.Union.<a href="/src/SeedUndiscriminatedUnions/Union/UnionClient.cs">DuplicateTypesUnionAsync</a>(OneOf&lt;string, IEnumerable&lt;string&gt;, int, HashSet&lt;string&gt;&gt; { ... }) -> OneOf&lt;string, IEnumerable&lt;string&gt;, int, HashSet&lt;string&gt;&gt;</code></summary>
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

<details><summary><code>client.Union.<a href="/src/SeedUndiscriminatedUnions/Union/UnionClient.cs">NestedUnionsAsync</a>(OneOf&lt;string, IEnumerable&lt;string&gt;, OneOf&lt;int, HashSet&lt;string&gt;, IEnumerable&lt;string&gt;, OneOf&lt;bool, HashSet&lt;string&gt;, IEnumerable&lt;string&gt;&gt;&gt;&gt; { ... }) -> string</code></summary>
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
        PaymentMethod = new TokenizeCard { Method = "card", CardNumber = "1234567890123456" },
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
