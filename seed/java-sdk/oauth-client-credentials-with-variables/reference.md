# Reference
## Auth
<details><summary><code>client.auth.gettokenwithclientcredentials(request) -> TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.auth().gettokenwithclientcredentials(
    AuthGetTokenWithClientCredentialsRequest
        .builder()
        .clientId("client_id")
        .clientSecret("client_secret")
        .audience(AuthGetTokenWithClientCredentialsRequestAudience.HTTPS_API_EXAMPLE_COM)
        .grantType(AuthGetTokenWithClientCredentialsRequestGrantType.CLIENT_CREDENTIALS)
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

**audience:** `AuthGetTokenWithClientCredentialsRequestAudience` 
    
</dd>
</dl>

<dl>
<dd>

**grantType:** `AuthGetTokenWithClientCredentialsRequestGrantType` 
    
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

<details><summary><code>client.auth.refreshtoken(request) -> TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.auth().refreshtoken(
    AuthRefreshTokenRequest
        .builder()
        .clientId("client_id")
        .clientSecret("client_secret")
        .refreshToken("refresh_token")
        .audience(AuthRefreshTokenRequestAudience.HTTPS_API_EXAMPLE_COM)
        .grantType(AuthRefreshTokenRequestGrantType.REFRESH_TOKEN)
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

**refreshToken:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**audience:** `AuthRefreshTokenRequestAudience` 
    
</dd>
</dl>

<dl>
<dd>

**grantType:** `AuthRefreshTokenRequestGrantType` 
    
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

## Service
<details><summary><code>client.service.post(endpointParam)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.service().post(
    "endpointParam",
    ServicePostRequest
        .builder()
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

**endpointParam:** `String` 
    
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

