# Reference
## Auth
<details><summary><code>$client-&gt;auth-&gt;getTokenWithClientCredentials($request) -> ?TokenResponse</code></summary>
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

## Simple
<details><summary><code>$client-&gt;simple-&gt;getSomething()</code></summary>
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

