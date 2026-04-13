# Reference
## Auth
<details><summary><code>$client-&gt;auth-&gt;gettokenwithclientcredentials($request) -> ?TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->auth->gettokenwithclientcredentials(
    new AuthGetTokenWithClientCredentialsRequest([
        'apiKey' => 'X-Api-Key',
        'clientId' => 'client_id',
        'clientSecret' => 'client_secret',
        'audience' => AuthGetTokenWithClientCredentialsRequestAudience::HttpsApiExampleCom->value,
        'grantType' => AuthGetTokenWithClientCredentialsRequestGrantType::ClientCredentials->value,
    ]),
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

**$apiKey:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$clientId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$clientSecret:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$audience:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$grantType:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$scope:** `?string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;auth-&gt;refreshtoken($request) -> ?TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->auth->refreshtoken(
    new AuthRefreshTokenRequest([
        'apiKey' => 'X-Api-Key',
        'clientId' => 'client_id',
        'clientSecret' => 'client_secret',
        'refreshToken' => 'refresh_token',
        'audience' => AuthRefreshTokenRequestAudience::HttpsApiExampleCom->value,
        'grantType' => AuthRefreshTokenRequestGrantType::RefreshToken->value,
    ]),
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

**$apiKey:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$clientId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$clientSecret:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$refreshToken:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$audience:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$grantType:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$scope:** `?string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## NestedNoAuthApi
<details><summary><code>$client-&gt;nestedNoAuthApi-&gt;nestedNoAuthApiGetSomething()</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->nestedNoAuthApi->nestedNoAuthApiGetSomething();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## NestedApi
<details><summary><code>$client-&gt;nestedApi-&gt;nestedApiGetSomething()</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->nestedApi->nestedApiGetSomething();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Simple
<details><summary><code>$client-&gt;simple-&gt;getsomething()</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->simple->getsomething();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

