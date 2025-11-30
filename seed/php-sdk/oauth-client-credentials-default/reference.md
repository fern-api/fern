# Reference
## Auth
<details><summary><code>$client->auth->getToken($request) -> TokenResponse</code></summary>
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

**$grantType:** `string` 
    
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
