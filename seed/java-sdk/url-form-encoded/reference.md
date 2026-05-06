# Reference
<details><summary><code>client.submitFormData(request) -> PostSubmitResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.submitFormData(
    SubmitFormDataRequest
        .builder()
        .username("johndoe")
        .email("john@example.com")
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

**username:** `String` — The user's username
    
</dd>
</dl>

<dl>
<dd>

**email:** `String` — The user's email address
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.getToken(request) -> TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.getToken(
    TokenRequest
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

**clientId:** `String` — Client identifier
    
</dd>
</dl>

<dl>
<dd>

**clientSecret:** `String` — Client secret
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

