# Reference
## Auth
<details><summary><code>client.Auth.<a href="/src/SeedAnyAuth/Auth/AuthClient.cs">GetTokenAsync</a>(SeedAnyAuth.GetTokenRequest { ... }) -> SeedAnyAuth.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Auth.GetTokenAsync(
    new SeedAnyAuth.GetTokenRequest
    {
        ClientId = "client_id",
        ClientSecret = "client_secret",
        Audience = "https://api.example.com",
        GrantType = "client_credentials",
        Scope = "scope",
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

**request:** `SeedAnyAuth.GetTokenRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## User
<details><summary><code>client.User.<a href="/src/SeedAnyAuth/User/UserClient.cs">GetAsync</a>() -> IEnumerable<SeedAnyAuth.User></code></summary>
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
