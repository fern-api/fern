# Reference
## Auth
<details><summary><code>client.Auth.<a href="/src/SeedOauthClientCredentials/Auth/AuthClient.cs">GetTokenWithClientCredentialsAsync</a>(SeedOauthClientCredentials.GetTokenRequest { ... }) -> SeedOauthClientCredentials.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Auth.GetTokenWithClientCredentialsAsync(
    new SeedOauthClientCredentials.GetTokenRequest
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

**request:** `SeedOauthClientCredentials.GetTokenRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Auth.<a href="/src/SeedOauthClientCredentials/Auth/AuthClient.cs">RefreshTokenAsync</a>(SeedOauthClientCredentials.RefreshTokenRequest { ... }) -> SeedOauthClientCredentials.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Auth.RefreshTokenAsync(
    new SeedOauthClientCredentials.RefreshTokenRequest
    {
        ClientId = "client_id",
        ClientSecret = "client_secret",
        RefreshToken = "refresh_token",
        Audience = "https://api.example.com",
        GrantType = "refresh_token",
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

**request:** `SeedOauthClientCredentials.RefreshTokenRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
