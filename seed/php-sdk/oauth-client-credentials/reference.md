# Reference
## Auth
<details><summary><code>$client->auth->getTokenWithClientCredentials($request) -> TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->auth->getTokenWithClientCredentials(
    new GetTokenRequest([
        'clientId' => 'my_oauth_app_123',
        'clientSecret' => 'sk_live_abcdef123456789',
        'audience' => 'https://api.example.com',
        'grantType' => 'client_credentials',
        'scope' => 'read:users',
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

<details><summary><code>$client->auth->refreshToken($request) -> TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->auth->refreshToken(
    new RefreshTokenRequest([
        'clientId' => 'my_oauth_app_123',
        'clientSecret' => 'sk_live_abcdef123456789',
        'refreshToken' => 'refresh_token',
        'audience' => 'https://api.example.com',
        'grantType' => 'refresh_token',
        'scope' => 'read:users',
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

## NestedNoAuth Api
<details><summary><code>$client->nestedNoAuth->api->getSomething()</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->nestedNoAuth->api->getSomething();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Nested Api
<details><summary><code>$client->nested->api->getSomething()</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->nested->api->getSomething();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Simple
<details><summary><code>$client->simple->getSomething()</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->simple->getSomething();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
