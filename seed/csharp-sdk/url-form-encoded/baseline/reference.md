# Reference
<details><summary><code>client.<a href="/src/SeedApi/SeedApiClient.cs">SubmitFormDataAsync</a>(PostSubmitRequest { ... }) -> WithRawResponseTask&lt;PostSubmitResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.SubmitFormDataAsync(
    new PostSubmitRequest { Username = "johndoe", Email = "john@example.com" }
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

**request:** `PostSubmitRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/src/SeedApi/SeedApiClient.cs">GetTokenAsync</a>(TokenRequest { ... }) -> WithRawResponseTask&lt;TokenResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.GetTokenAsync(
    new TokenRequest { ClientId = "client_id", ClientSecret = "client_secret" }
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

**request:** `TokenRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

