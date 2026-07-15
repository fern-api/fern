# Reference
## Auth
<details><summary><code>client.auth.createOauth2Token(request) -> TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.auth().createOauth2Token(
    CreateOauth2TokenRequest
        .builder()
        .clientId("my_oauth_app_123")
        .clientSecret("sk_live_abcdef123456789")
        .grantType("client_credentials")
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

**clientId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**clientSecret:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**grantType:** `Optional<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

