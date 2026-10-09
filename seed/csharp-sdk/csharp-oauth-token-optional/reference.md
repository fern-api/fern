# Reference
## Auth
<details><summary><code>client.Auth.<a href="/src/SeedCsharpOauthTokenOptional/Auth/AuthClient.cs">CreateOauth2TokenAsync</a>(CreateOauth2TokenRequest { ... }) -> WithRawResponseTask&lt;TokenResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Auth.CreateOauth2TokenAsync(
    new CreateOauth2TokenRequest
    {
        ClientId = "my_oauth_app_123",
        ClientSecret = "sk_live_abcdef123456789",
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

**request:** `CreateOauth2TokenRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

