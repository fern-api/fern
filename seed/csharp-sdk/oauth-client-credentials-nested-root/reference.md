# Reference
## Auth
<details><summary><code>client.Auth.<a href="/src/SeedOauthClientCredentials/Auth/AuthClient.cs">GetTokenAsync</a>(SeedOauthClientCredentials.Auth.GetTokenRequest { ... }) -> SeedOauthClientCredentials.Auth.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Auth.GetTokenAsync(
    new SeedOauthClientCredentials.Auth.GetTokenRequest
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

**request:** `SeedOauthClientCredentials.Auth.GetTokenRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
