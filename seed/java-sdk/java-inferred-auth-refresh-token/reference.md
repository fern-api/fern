# Reference
## Auth
<details><summary><code>client.auth.getTokenWithRefreshToken(request) -> TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.auth().getTokenWithRefreshToken(
    GetTokenRequest
        .builder()
        .refreshToken("my-refresh-token")
        .grantType("refresh_token")
        .scope("read")
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

**refreshToken:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**grantType:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**scope:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**code:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**codeVerifier:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**redirectUri:** `Optional<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Simple
<details><summary><code>client.simple.getSomething()</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.simple().getSomething();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

