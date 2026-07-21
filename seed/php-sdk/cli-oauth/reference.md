# Reference
## Auth
<details><summary><code>$client-&gt;auth-&gt;getToken($request) -> ?TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->auth->getToken(
    new GetTokenAuthRequest([
        'clientId' => 'client_id',
        'clientSecret' => 'client_secret',
        'scopes' => 'scopes',
        'grantType' => GetTokenAuthRequestGrantType::ClientCredentials->value,
        'tenant' => 'tenant',
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

**$audience:** `?string` 
    
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

**$scopes:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$grantType:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$tenant:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$optionalHint:** `?string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;auth-&gt;refreshToken($request) -> ?TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->auth->refreshToken(
    new RefreshTokenAuthRequest([
        'refreshToken' => 'refresh_token',
        'grantType' => RefreshTokenAuthRequestGrantType::RefreshToken->value,
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

**$refreshToken:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$grantType:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## System
<details><summary><code>$client-&gt;system-&gt;health()</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->system->health();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Pets
<details><summary><code>$client-&gt;pets-&gt;list() -> ?array</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->pets->list();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

