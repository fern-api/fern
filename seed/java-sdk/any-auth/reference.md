# Reference
## Auth
<details><summary><code>client.auth.gettoken(request) -> TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.auth().gettoken(
    AuthGetTokenRequest
        .builder()
        .clientId("client_id")
        .clientSecret("client_secret")
        .audience(AuthGetTokenRequestAudience.HTTPS_API_EXAMPLE_COM)
        .grantType(AuthGetTokenRequestGrantType.CLIENT_CREDENTIALS)
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

**audience:** `AuthGetTokenRequestAudience` 
    
</dd>
</dl>

<dl>
<dd>

**grantType:** `AuthGetTokenRequestGrantType` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## User
<details><summary><code>client.user.get() -> List&amp;lt;User&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.user().get();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.user.getadmins() -> List&amp;lt;User&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.user().getadmins();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

