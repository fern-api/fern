# Reference
## Auth
<details><summary><code>client.auth.getToken(request) -> TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.auth().getToken(
    GetTokenRequest
        .builder()
        .grantType("client_credentials")
        .clientId("my_oauth_app_123")
        .clientSecret("sk_live_abcdef123456789")
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

**grantType:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**clientId:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**clientSecret:** `Optional<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

