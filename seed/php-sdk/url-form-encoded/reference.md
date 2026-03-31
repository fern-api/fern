# Reference
<details><summary><code>$client-&gt;submitFormData($request) -> ?PostSubmitResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->submitFormData(
    new PostSubmitRequest([
        'username' => 'johndoe',
        'email' => 'john@example.com',
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

**$username:** `string` — The user's username
    
</dd>
</dl>

<dl>
<dd>

**$email:** `string` — The user's email address
    
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

**$request:** `TokenRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

