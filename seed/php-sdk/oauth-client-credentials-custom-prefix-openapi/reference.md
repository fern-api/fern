# Reference
## Identity
<details><summary><code>$client-&gt;identity-&gt;getToken($request) -> ?TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->identity->getToken(
    new GetTokenIdentityRequest([
        'username' => 'username',
        'password' => 'password',
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

**$username:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$password:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Plants
<details><summary><code>$client-&gt;plants-&gt;list() -> ?array</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->plants->list();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;plants-&gt;get($plantId) -> ?Plant</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->plants->get(
    'plantId',
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

**$plantId:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

