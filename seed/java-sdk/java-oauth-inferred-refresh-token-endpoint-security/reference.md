# Reference
## Auth
<details><summary><code>client.auth.getToken(request) -> TokenResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

One token endpoint that dispatches on grant_type (client_credentials or refresh_token).
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
client.auth().getToken(
    GetTokenRequest
        .builder()
        .grantType("refresh_token")
        .refreshToken("my-refresh-token")
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

<dl>
<dd>

**refreshToken:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**scope:** `Optional<String>` 
    
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

