# Reference
## Oauth
<details><summary><code>client.oauth.<a href="/lib/seed/oauth/client.rb">authorize</a>() -> ::Seed::Types::AuthorizeResponse</code></summary>
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

```ruby
client.oauth.authorize(
  response_type: "code",
  client_id: "client_abc123",
  redirect_uri: "https://example.com/callback",
  code_challenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
  code_challenge_method: "S256",
  scope: "read write",
  state: "xyz"
)
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

**response_type:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**client_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**redirect_uri:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**code_challenge:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**code_challenge_method:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**scope:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**state:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Oauth::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

