# Reference
## User
<details><summary><code>$client->user->createUsername($request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->user->createUsername(
    new CreateUsernameRequest([
        'tags' => [
            'tags',
            'tags',
        ],
        'username' => 'username',
        'password' => 'password',
        'name' => 'test',
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

**$tags:** `array` 
    
</dd>
</dl>

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

<dl>
<dd>

**$name:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->user->createUsernameWithReferencedType($request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->user->createUsernameWithReferencedType(
    new CreateUsernameReferencedRequest([
        'tags' => [
            'tags',
            'tags',
        ],
        'body' => new CreateUsernameBody([
            'username' => 'username',
            'password' => 'password',
            'name' => 'test',
        ]),
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

**$tags:** `array` 
    
</dd>
</dl>

<dl>
<dd>

**$request:** `CreateUsernameBody` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->user->createUsernameOptional($request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->user->createUsernameOptional(
    new CreateUsernameBodyOptionalProperties([]),
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

**$request:** `?CreateUsernameBodyOptionalProperties` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->user->getUsername($request) -> User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->user->getUsername(
    new GetUsersRequest([
        'limit' => 1,
        'id' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
        'date' => new DateTime('2023-01-15'),
        'deadline' => new DateTime('2024-01-15T09:30:00Z'),
        'bytes' => 'SGVsbG8gd29ybGQh',
        'user' => new User([
            'name' => 'name',
            'tags' => [
                'tags',
                'tags',
            ],
        ]),
        'userList' => [
            new User([
                'name' => 'name',
                'tags' => [
                    'tags',
                    'tags',
                ],
            ]),
            new User([
                'name' => 'name',
                'tags' => [
                    'tags',
                    'tags',
                ],
            ]),
        ],
        'optionalDeadline' => new DateTime('2024-01-15T09:30:00Z'),
        'keyValue' => [
            'keyValue' => 'keyValue',
        ],
        'optionalString' => 'optionalString',
        'nestedUser' => new NestedUser([
            'name' => 'name',
            'user' => new User([
                'name' => 'name',
                'tags' => [
                    'tags',
                    'tags',
                ],
            ]),
        ]),
        'optionalUser' => new User([
            'name' => 'name',
            'tags' => [
                'tags',
                'tags',
            ],
        ]),
        'excludeUser' => [
            new User([
                'name' => 'name',
                'tags' => [
                    'tags',
                    'tags',
                ],
            ]),
        ],
        'filter' => [
            'filter',
        ],
        'longParam' => 1000000,
        'bigIntParam' => '1000000',
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

**$limit:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**$id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$date:** `DateTime` 
    
</dd>
</dl>

<dl>
<dd>

**$deadline:** `DateTime` 
    
</dd>
</dl>

<dl>
<dd>

**$bytes:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$user:** `User` 
    
</dd>
</dl>

<dl>
<dd>

**$userList:** `array` 
    
</dd>
</dl>

<dl>
<dd>

**$optionalDeadline:** `?DateTime` 
    
</dd>
</dl>

<dl>
<dd>

**$keyValue:** `array` 
    
</dd>
</dl>

<dl>
<dd>

**$optionalString:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$nestedUser:** `NestedUser` 
    
</dd>
</dl>

<dl>
<dd>

**$optionalUser:** `?User` 
    
</dd>
</dl>

<dl>
<dd>

**$excludeUser:** `User` 
    
</dd>
</dl>

<dl>
<dd>

**$filter:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$longParam:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**$bigIntParam:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
