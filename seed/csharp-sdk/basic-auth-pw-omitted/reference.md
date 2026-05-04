# Reference
## BasicAuth
<details><summary><code>client.BasicAuth.<a href="/src/SeedBasicAuthPwOmitted/BasicAuth/BasicAuthClient.cs">GetWithBasicAuthAsync</a>() -> WithRawResponseTask&lt;bool&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET request with basic auth scheme
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.BasicAuth.GetWithBasicAuthAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.BasicAuth.<a href="/src/SeedBasicAuthPwOmitted/BasicAuth/BasicAuthClient.cs">PostWithBasicAuthAsync</a>(object { ... }) -> WithRawResponseTask&lt;bool&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

POST request with basic auth scheme
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.BasicAuth.PostWithBasicAuthAsync(
    new Dictionary<object, object?>() { { "key", "value" } }
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

**request:** `object` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

