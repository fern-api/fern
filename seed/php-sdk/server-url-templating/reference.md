# Reference
<details><summary><code>$client-&gt;getUsers() -> ?array</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->getUsers();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;getUser($userId) -> ?User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->getUser(
    'userId',
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

**$userId:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;getToken($request) -> ?TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->getToken(
    new TokenRequest([
        'clientId' => 'client_id',
        'clientSecret' => 'client_secret',
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
</dd>
</dl>


</dd>
</dl>
</details>

