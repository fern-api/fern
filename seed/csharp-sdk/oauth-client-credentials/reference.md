# Reference
## Auth
<details><summary><code>client.Auth.<a href="/src/SeedOauthClientCredentials/Auth/AuthClient.cs">GetTokenWithClientCredentialsAsync</a>(GetTokenRequest { ... }) -> TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Auth.GetTokenWithClientCredentialsAsync(
    new GetTokenRequest
    {
        ClientId = "string",
        ClientSecret = "string",
        Audience = "https://api.example.com",
        GrantType = "client_credentials",
        Scope = "string",
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

<details><summary><code>client.Auth.<a href="/src/SeedOauthClientCredentials/Auth/AuthClient.cs">RefreshTokenAsync</a>(RefreshTokenRequest { ... }) -> TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Auth.RefreshTokenAsync(
    new RefreshTokenRequest
    {
        ClientId = "string",
        ClientSecret = "string",
        RefreshToken = "string",
        Audience = "https://api.example.com",
        GrantType = "refresh_token",
        Scope = "string",
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

**request:** `RefreshTokenRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
