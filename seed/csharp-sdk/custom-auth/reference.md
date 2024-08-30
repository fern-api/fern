# Reference
## CustomAuth
<details><summary><code>client.CustomAuth.<a href="/src/SeedCustomAuth/CustomAuth/CustomAuthClient.cs">GetWithCustomAuthAsync</a>() -> bool</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET request with custom auth scheme
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
await client.CustomAuth.GetWithCustomAuthAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.CustomAuth.<a href="/src/SeedCustomAuth/CustomAuth/CustomAuthClient.cs">PostWithCustomAuthAsync</a>(object { ... }) -> bool</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

POST request with custom auth scheme
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
await client.CustomAuth.PostWithCustomAuthAsync(
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
