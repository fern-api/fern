# Reference
## Oauth
<details><summary><code>client.Oauth.<a href="/src/SeedOauthPkce/Oauth/OauthClient.cs">AuthorizeAsync</a>(AuthorizeRequest { ... }) -> WithRawResponseTask&lt;AuthorizeResponse&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Authorization-code grant with PKCE. `response_type` is a required literal that is
hardcoded by the generated method; `code_challenge_method` is an optional literal
that must still be sent on the wire when provided.
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
await client.Oauth.AuthorizeAsync(
    new AuthorizeRequest
    {
        ResponseType = "code",
        ClientId = "client_abc123",
        RedirectUri = "https://example.com/callback",
        CodeChallenge = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
        CodeChallengeMethod = "S256",
        Scope = "read write",
        State = "xyz",
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

**request:** `AuthorizeRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

