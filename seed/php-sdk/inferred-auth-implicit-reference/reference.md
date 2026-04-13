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
    new GetTokenRequest([
        'clientId' => 'client_id',
        'clientSecret' => 'client_secret',
        'audience' => GetTokenRequestAudience::HttpsApiExampleCom->value,
        'grantType' => GetTokenRequestGrantType::ClientCredentials->value,
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
    new RefreshTokenRequest([
        'clientId' => 'client_id',
        'clientSecret' => 'client_secret',
        'refreshToken' => 'refresh_token',
        'audience' => RefreshTokenRequestAudience::HttpsApiExampleCom->value,
        'grantType' => RefreshTokenRequestGrantType::RefreshToken->value,
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

