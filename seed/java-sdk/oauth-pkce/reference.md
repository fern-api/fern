# Reference
## Oauth
<details><summary><code>client.oauth.authorize() -> AuthorizeResponse</code></summary>
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

```java
client.oauth().authorize(
    AuthorizeRequest
        .builder()
        .clientId("client_abc123")
        .redirectUri("https://example.com/callback")
        .codeChallenge("E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM")
        .codeChallengeMethod("S256")
        .scope("read write")
        .state("xyz")
        .build()
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

**responseType:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**clientId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**redirectUri:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**codeChallenge:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**codeChallengeMethod:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**scope:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**state:** `Optional<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

