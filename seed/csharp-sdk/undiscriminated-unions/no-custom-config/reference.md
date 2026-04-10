# Reference
## Union
<details><summary><code>client.Union.<a href="/src/SeedApi/Union/UnionClient.cs">GetAsync</a>(OneOf&lt;string, int, IEnumerable&lt;int&gt;, IEnumerable&lt;IEnumerable&lt;int&gt;&gt;, IEnumerable&lt;string&gt;&gt; { ... }) -> WithRawResponseTask&lt;OneOf&lt;string, int, IEnumerable&lt;int&gt;, IEnumerable&lt;IEnumerable&lt;int&gt;&gt;, IEnumerable&lt;string&gt;&gt;&gt;</code></summary>
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

**request:** `OneOf<string, int, IEnumerable<int>, IEnumerable<IEnumerable<int>>, IEnumerable<string>>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Union.<a href="/src/SeedApi/Union/UnionClient.cs">GetmetadataAsync</a>() -> WithRawResponseTask&lt;Dictionary&lt;string, string&gt;&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Union.GetmetadataAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Union.<a href="/src/SeedApi/Union/UnionClient.cs">UpdatemetadataAsync</a>(OneOf&lt;Dictionary&lt;string, object?&gt;?, NamedMetadata&gt; { ... }) -> WithRawResponseTask&lt;bool&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Union.UpdatemetadataAsync(new Dictionary<string, object?>() { { "key", "value" } });
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

<details><summary><code>client.Union.<a href="/src/SeedApi/Union/UnionClient.cs">CallAsync</a>(Request { ... }) -> WithRawResponseTask&lt;bool&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Union.CallAsync(new Request());
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

<details><summary><code>client.Union.<a href="/src/SeedApi/Union/UnionClient.cs">DuplicatetypesunionAsync</a>(OneOf&lt;string, int, IEnumerable&lt;string&gt;&gt; { ... }) -> WithRawResponseTask&lt;OneOf&lt;string, int, IEnumerable&lt;string&gt;&gt;&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Union.DuplicatetypesunionAsync("string");
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

**request:** `OneOf<string, int, IEnumerable<string>>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Union.<a href="/src/SeedApi/Union/UnionClient.cs">NestedunionsAsync</a>(OneOf&lt;string, IEnumerable&lt;string&gt;, OneOf&lt;int, IEnumerable&lt;string&gt;, OneOf&lt;bool, IEnumerable&lt;string&gt;&gt;&gt;&gt; { ... }) -> WithRawResponseTask&lt;string&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Union.NestedunionsAsync("string");
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

**request:** `OneOf<string, IEnumerable<string>, OneOf<int, IEnumerable<string>, OneOf<bool, IEnumerable<string>>>>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Union.<a href="/src/SeedApi/Union/UnionClient.cs">TestcamelcasepropertiesAsync</a>(UnionTestCamelCasePropertiesRequest { ... }) -> WithRawResponseTask&lt;string&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Union.TestcamelcasepropertiesAsync(
    new UnionTestCamelCasePropertiesRequest
    {
        PaymentMethod = new TokenizeCard { Method = "method", CardNumber = "cardNumber" },
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

**request:** `UnionTestCamelCasePropertiesRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

