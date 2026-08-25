# Reference
<details><summary><code>client.listItems() -> List&amp;lt;String&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.listItems();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Oauth
<details><summary><code>client.oauth.getToken(request) -> GetTokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.oauth().getToken(
    GetTokenRequest
        .builder()
        .clientId("client_id")
        .clientSecret("client_secret")
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
</dd>
</dl>


</dd>
</dl>
</details>

