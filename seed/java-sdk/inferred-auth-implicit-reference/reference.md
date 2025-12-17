# Reference
## Auth
<details><summary><code>client.auth.getTokenWithClientCredentials(request) -> TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.auth().getTokenWithClientCredentials(
    GetTokenRequest
        .builder()
        .clientId("client_id")
        .clientSecret("client_secret")
        .scope("scope")
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

**request:** `GetTokenRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.auth.refreshToken(request) -> TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.auth().refreshToken(
    RefreshTokenRequest
        .builder()
        .clientId("client_id")
        .clientSecret("client_secret")
        .refreshToken("refresh_token")
        .scope("scope")
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

**request:** `RefreshTokenRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## NestedNoAuth Api
<details><summary><code>client.nestedNoAuth.api.getSomething()</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.nestedNoAuth().api().getSomething();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Nested Api
<details><summary><code>client.nested.api.getSomething()</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.nested().api().getSomething();
```
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
