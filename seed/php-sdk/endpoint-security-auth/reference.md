# Reference
## Auth
<details><summary><code>$client-&gt;auth-&gt;getToken($request) -> TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->auth->getToken(
    new GetTokenRequest([
        'clientId' => 'client_id',
        'clientSecret' => 'client_secret',
        'audience' => 'https://api.example.com',
        'grantType' => 'client_credentials',
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
<details><summary><code>$client-&gt;user-&gt;getWithBearer() -> array</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->user->getWithBearer();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;user-&gt;getWithApiKey() -> array</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->user->getWithBearer();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;user-&gt;getWithOAuth() -> array</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->user->getWithBearer();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;user-&gt;getWithBasic() -> array</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->user->getWithBearer();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;user-&gt;getWithInferredAuth() -> array</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->user->getWithBearer();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;user-&gt;getWithAnyAuth() -> array</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->user->getWithBearer();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;user-&gt;getWithAllAuth() -> array</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->user->getWithBearer();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
