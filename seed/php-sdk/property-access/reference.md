# Reference
<details><summary><code>$client->createUser($request) -> User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->createUser(
    new User([
        'id' => 'id',
        'email' => 'email',
        'password' => 'password',
        'profile' => new UserProfile([
            'name' => 'name',
            'verification' => new UserProfileVerification([
                'verified' => 'verified',
            ]),
            'ssn' => 'ssn',
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

**$request:** `User` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
