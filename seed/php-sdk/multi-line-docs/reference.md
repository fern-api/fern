# Reference
## User
<details><summary><code>$client->user->getUser($userId)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieve a user.
This endpoint is used to retrieve a user.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->user->getUser(
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

The ID of the user to retrieve.
This ID is unique to each user.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->user->createUser($request) -> User</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Create a new user.
This endpoint is used to create a new user.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->user->createUser(
    new CreateUserRequest([
        'name' => 'name',
        'age' => 1,
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

**$name:** `string` 

The name of the user to create.
This name is unique to each user.
    
</dd>
</dl>

<dl>
<dd>

**$age:** `?int` 

The age of the user.
This property is not required.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
