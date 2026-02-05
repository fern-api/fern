# Reference
## Auth
<details><summary><code>client.Auth.<a href="/src/SeedAnyAuth/Auth/AuthClient.cs">GetTokenAsync</a>(GetTokenRequest { ... }) -> WithRawResponseTask&lt;TokenResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Auth.GetTokenAsync(
    new GetTokenRequest
    {
        ClientId = "client_id",
        ClientSecret = "client_secret",
        Audience = "https://api.example.com",
        GrantType = "client_credentials",
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

**request:** `GetTokenRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## User
<details><summary><code>client.User.<a href="/src/SeedAnyAuth/User/UserClient.cs">GetAsync</a>() -> WithRawResponseTask&lt;IEnumerable&lt;User&gt;&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.User.GetAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.User.<a href="/src/SeedAnyAuth/User/UserClient.cs">GetAdminsAsync</a>() -> WithRawResponseTask&lt;IEnumerable&lt;User&gt;&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.User.GetAdminsAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
