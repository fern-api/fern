# Reference
## Oauth
<details><summary><code>client.oauth.<a href="/src/api/resources/oauth/client/Client.ts">authorize</a>({ ...params }) -> SeedOauthPkce.AuthorizeResponse</code></summary>
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

```typescript
await client.oauth.authorize({
    response_type: "code",
    client_id: "client_abc123",
    redirect_uri: "https://example.com/callback",
    code_challenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
    code_challenge_method: "S256",
    scope: "read write",
    state: "xyz"
});

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

**request:** `SeedOauthPkce.AuthorizeRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `OauthClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

