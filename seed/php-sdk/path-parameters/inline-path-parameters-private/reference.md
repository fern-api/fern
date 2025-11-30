# Reference
## Organizations
<details><summary><code>$client->organizations->getOrganization($tenantId, $organizationId) -> Organization</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->organizations->getOrganization(
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

<details><summary><code>$client->organizations->getOrganizationUser($request) -> User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->organizations->getOrganizationUser(
    new GetOrganizationUserRequest([
        'tenantId' => 'tenant_id',
        'organizationId' => 'organization_id',
        'userId' => 'user_id',
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

<details><summary><code>$client->organizations->searchOrganizations($tenantId, $organizationId, $request) -> array</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->organizations->searchOrganizations(
    'tenant_id',
    'organization_id',
    new SearchOrganizationsRequest([
        'limit' => 1,
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
<details><summary><code>$client->user->getUser($request) -> User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->user->getUser(
    new GetUsersRequest([
        'tenantId' => 'tenant_id',
        'userId' => 'user_id',
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->user->createUser($tenantId, $request) -> User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->user->createUser(
    'tenant_id',
    new User([
        'name' => 'name',
        'tags' => [
            'tags',
            'tags',
        ],
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

<details><summary><code>$client->user->updateUser($request) -> User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->user->updateUser(
    new UpdateUserRequest([
        'tenantId' => 'tenant_id',
        'userId' => 'user_id',
        'body' => new User([
            'name' => 'name',
            'tags' => [
                'tags',
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

<details><summary><code>$client->user->searchUsers($request) -> array</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->user->searchUsers(
    new SearchUsersRequest([
        'tenantId' => 'tenant_id',
        'userId' => 'user_id',
        'limit' => 1,
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

**$limit:** `?int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->user->getUserMetadata($request) -> User</code></summary>
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
$client->user->getUserMetadata(
    new GetUserMetadataRequest([
        'tenantId' => 'tenant_id',
        'userId' => 'user_id',
        'version' => 1,
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

**$version:** `int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->user->getUserSpecifics($request) -> User</code></summary>
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
$client->user->getUserSpecifics(
    new GetUserSpecificsRequest([
        'tenantId' => 'tenant_id',
        'userId' => 'user_id',
        'version' => 1,
        'thought' => 'thought',
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
