# Reference
## Auth
<details><summary><code>client.Auth.CreateOauth2Token(request) -> *fern.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.CreateOauth2TokenRequest{
    ClientID: "my_oauth_app_123",
    ClientSecret: "sk_live_abcdef123456789",
    GrantType: fern.String(
        "client_credentials",
    ),
}
client.Auth.CreateOauth2Token(
    context.TODO(),
    request,
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

**clientID:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**clientSecret:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**grantType:** `*string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

