# Reference
## Auth
<details><summary><code>client.Auth.<a href="/src/SeedWebsocketOauth/Auth/AuthClient.cs">GetTokenWithClientCredentialsAsync</a>(GetTokenRequest { ... }) -> WithRawResponseTask&lt;TokenResponse&gt;</code></summary>
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
        ClientId = "my_oauth_app_123",
        ClientSecret = "sk_live_abcdef123456789",
        Audience = "https://api.example.com",
        GrantType = "client_credentials",
        Scope = "read:users",
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

