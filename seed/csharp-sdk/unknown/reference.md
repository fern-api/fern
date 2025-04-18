# Reference
## Unknown
<details><summary><code>client.Unknown.<a href="/src/SeedUnknownAsAny/Unknown/UnknownClient.cs">PostAsync</a>(object { ... }) -> IEnumerable<object></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Unknown.PostAsync(new Dictionary<object, object?>() { { "key", "value" } });
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

**request:** `object` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Unknown.<a href="/src/SeedUnknownAsAny/Unknown/UnknownClient.cs">PostObjectAsync</a>(MyObject { ... }) -> IEnumerable<object></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Unknown.PostObjectAsync(
    new MyObject { Unknown = new Dictionary<object, object?>() { { "key", "value" } } }
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

**request:** `MyObject` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
