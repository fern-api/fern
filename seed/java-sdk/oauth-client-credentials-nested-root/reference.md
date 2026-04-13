# Reference
## Auth
<details><summary><code>client.auth.gettoken(request) -> AuthTokenResponse</code></summary>
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

## NestedNoAuthApi
<details><summary><code>client.nestedNoAuthApi.nestedNoAuthApiGetSomething()</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.nestedNoAuthApi().nestedNoAuthApiGetSomething();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## NestedApi
<details><summary><code>client.nestedApi.nestedApiGetSomething()</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.nestedApi().nestedApiGetSomething();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Simple
<details><summary><code>client.simple.getsomething()</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.simple().getsomething();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

