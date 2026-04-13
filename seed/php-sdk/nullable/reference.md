# Reference
## Nullable
<details><summary><code>$client-&gt;nullable-&gt;getusers($request) -> ?array</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->nullable->getusers(
    new NullableGetUsersRequest([]),
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

**$usernames:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$avatar:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$activated:** `?bool` 
    
</dd>
</dl>

<dl>
<dd>

**$tags:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$extra:** `?bool` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;nullable-&gt;createuser($request) -> ?User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->nullable->createuser(
    new NullableCreateUserRequest([
        'username' => 'username',
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

**$tags:** `?array` 
    
</dd>
</dl>

<dl>
<dd>

**$metadata:** `?Metadata` 
    
</dd>
</dl>

<dl>
<dd>

**$avatar:** `?string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;nullable-&gt;deleteuser($request) -> ?bool</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->nullable->deleteuser(
    new NullableDeleteUserRequest([]),
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

**$username:** `?string` — The user to delete.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

