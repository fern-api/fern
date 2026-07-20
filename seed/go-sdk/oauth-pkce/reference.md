# Reference
## Oauth
<details><summary><code>client.Oauth.Authorize() -> *fern.AuthorizeResponse</code></summary>
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

```go
request := &fern.AuthorizeRequest{
        ClientID: "client_abc123",
        RedirectURI: "https://example.com/callback",
        CodeChallenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
        CodeChallengeMethod: fern.String(
            "S256",
        ),
        Scope: fern.String(
            "read write",
        ),
        State: fern.String(
            "xyz",
        ),
    }
client.Oauth.Authorize(
        context.TODO(),
        request,
    )
}
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

**responseType:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**clientID:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**redirectURI:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**codeChallenge:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**codeChallengeMethod:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**scope:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**state:** `*string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

