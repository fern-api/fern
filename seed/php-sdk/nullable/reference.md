# Reference
## Nullable
<details><summary><code>$client->nullable->getUsers($request) -> array</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->nullable->getUsers(
    new GetUsersRequest([
        'usernames' => [
            'usernames',
        ],
        'avatar' => 'avatar',
        'activated' => [
            true,
        ],
        'tags' => [
            'tags',
        ],
        'extra' => true,
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

<details><summary><code>$client->nullable->createUser($request) -> User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->nullable->createUser(
    new CreateUserRequest([
        'username' => 'username',
        'tags' => [
            'tags',
            'tags',
        ],
        'metadata' => new Metadata([
            'createdAt' => new DateTime('2024-01-15T09:30:00Z'),
            'updatedAt' => new DateTime('2024-01-15T09:30:00Z'),
            'avatar' => 'avatar',
            'activated' => true,
            'status' => Status::active(),
            'values' => [
                'values' => 'values',
            ],
        ]),
        'avatar' => 'avatar',
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

<details><summary><code>$client->nullable->deleteUser($request) -> bool</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->nullable->deleteUser(
    new DeleteUserRequest([
        'username' => 'xy',
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

**$username:** `?string` — The user to delete.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
