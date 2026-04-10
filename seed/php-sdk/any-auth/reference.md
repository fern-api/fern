# Reference
## Auth
<details><summary><code>$client-&gt;auth-&gt;gettoken($request) -> ?TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->auth->gettoken(
    new AuthGetTokenRequest([
        'clientId' => 'client_id',
        'clientSecret' => 'client_secret',
        'audience' => AuthGetTokenRequestAudience::HttpsApiExampleCom->value,
        'grantType' => AuthGetTokenRequestGrantType::ClientCredentials->value,
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
</dd>
</dl>


</dd>
</dl>
</details>

## User
<details><summary><code>$client-&gt;user-&gt;get() -> ?array</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->user->get();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;user-&gt;getadmins() -> ?array</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->user->getadmins();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

