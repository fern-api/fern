# Reference
## Organizations
<details><summary><code>$client-&gt;organizations-&gt;getorganization($tenantId, $organizationId) -> ?Organization</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->organizations->getorganization(
    'tenant_id',
    'organization_id',
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

**$tenantId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$organizationId:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;organizations-&gt;getorganizationuser($tenantId, $organizationId, $userId) -> ?User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->organizations->getorganizationuser(
    'tenant_id',
    'organization_id',
    'user_id',
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

**$tenantId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$organizationId:** `string` 
    
</dd>
</dl>

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

<details><summary><code>$client-&gt;organizations-&gt;searchorganizations($tenantId, $organizationId, $request) -> ?array</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->organizations->searchorganizations(
    'tenant_id',
    'organization_id',
    new OrganizationsSearchOrganizationsRequest([]),
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

**$tenantId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$organizationId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$limit:** `?int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## User
<details><summary><code>$client-&gt;user-&gt;getuser($tenantId, $userId) -> ?User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->user->getuser(
    'tenant_id',
    'user_id',
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

**$tenantId:** `string` 
    
</dd>
</dl>

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

<details><summary><code>$client-&gt;user-&gt;updateuser($tenantId, $userId, $request) -> ?User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->user->updateuser(
    'tenant_id',
    'user_id',
    new UserUpdateUserRequest([
        'body' => new User([
            'name' => 'name',
            'tags' => [
                'tags',
            ],
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

**$tenantId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$userId:** `string` 
    
</dd>
</dl>

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

<details><summary><code>$client-&gt;user-&gt;createuser($tenantId, $request) -> ?User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->user->createuser(
    'tenant_id',
    new UserCreateUserRequest([
        'body' => new User([
            'name' => 'name',
            'tags' => [
                'tags',
            ],
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

**$tenantId:** `string` 
    
</dd>
</dl>

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

<details><summary><code>$client-&gt;user-&gt;searchusers($tenantId, $userId, $request) -> ?array</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->user->searchusers(
    'tenant_id',
    'user_id',
    new UserSearchUsersRequest([]),
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

**$tenantId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$userId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$limit:** `?int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;user-&gt;getusermetadata($tenantId, $userId, $version) -> ?User</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Test endpoint with path parameter that has a text prefix (v{version})
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
$client->user->getusermetadata(
    'tenant_id',
    'user_id',
    1,
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

**$tenantId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$userId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$version:** `int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;user-&gt;getuserspecifics($tenantId, $userId, $version, $thought) -> ?User</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Test endpoint with path parameters listed in different order than found in path
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
$client->user->getuserspecifics(
    'tenant_id',
    'user_id',
    1,
    'thought',
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

**$tenantId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$userId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$version:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**$thought:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

