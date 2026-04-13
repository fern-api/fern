# Reference
## Auth
<details><summary><code>client.Auth.<a href="/src/SeedApi/Auth/AuthClient.cs">GettokenwithclientcredentialsAsync</a>(AuthGetTokenWithClientCredentialsRequest { ... }) -> WithRawResponseTask&lt;TokenResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Auth.GettokenwithclientcredentialsAsync(
    new AuthGetTokenWithClientCredentialsRequest
    {
        ClientId = "client_id",
        ClientSecret = "client_secret",
        Audience = AuthGetTokenWithClientCredentialsRequestAudience.HttpsApiExampleCom,
        GrantType = AuthGetTokenWithClientCredentialsRequestGrantType.ClientCredentials,
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

**request:** `AuthGetTokenWithClientCredentialsRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Auth.<a href="/src/SeedApi/Auth/AuthClient.cs">RefreshtokenAsync</a>(AuthRefreshTokenRequest { ... }) -> WithRawResponseTask&lt;TokenResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Auth.RefreshtokenAsync(
    new AuthRefreshTokenRequest
    {
        ClientId = "client_id",
        ClientSecret = "client_secret",
        RefreshToken = "refresh_token",
        Audience = AuthRefreshTokenRequestAudience.HttpsApiExampleCom,
        GrantType = AuthRefreshTokenRequestGrantType.RefreshToken,
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

**request:** `AuthRefreshTokenRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

