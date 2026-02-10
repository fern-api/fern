# Reference
## Union
<details><summary><code>client.Union.<a href="/src/SeedUndiscriminatedUnions/Union/UnionClient.cs">GetAsync</a>(MyUnion { ... }) -> WithRawResponseTask&lt;MyUnion&gt;</code></summary>
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

**request:** `MyUnion` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Union.<a href="/src/SeedUndiscriminatedUnions/Union/UnionClient.cs">GetMetadataAsync</a>() -> WithRawResponseTask&lt;Dictionary&lt;Key, string&gt;&gt;</code></summary>
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

<details><summary><code>client.Union.<a href="/src/SeedUndiscriminatedUnions/Union/UnionClient.cs">UpdateMetadataAsync</a>(MetadataUnion { ... }) -> WithRawResponseTask&lt;bool&gt;</code></summary>
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

**request:** `MetadataUnion` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Union.<a href="/src/SeedUndiscriminatedUnions/Union/UnionClient.cs">CallAsync</a>(Request { ... }) -> WithRawResponseTask&lt;bool&gt;</code></summary>
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

<details><summary><code>client.Union.<a href="/src/SeedUndiscriminatedUnions/Union/UnionClient.cs">DuplicateTypesUnionAsync</a>(UnionWithDuplicateTypes { ... }) -> WithRawResponseTask&lt;UnionWithDuplicateTypes&gt;</code></summary>
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

**request:** `UnionWithDuplicateTypes` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Union.<a href="/src/SeedUndiscriminatedUnions/Union/UnionClient.cs">NestedUnionsAsync</a>(NestedUnionRoot { ... }) -> WithRawResponseTask&lt;string&gt;</code></summary>
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

**request:** `NestedUnionRoot` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Union.<a href="/src/SeedUndiscriminatedUnions/Union/UnionClient.cs">TestCamelCasePropertiesAsync</a>(PaymentRequest { ... }) -> WithRawResponseTask&lt;string&gt;</code></summary>
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
