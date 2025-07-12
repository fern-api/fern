# Reference
## Organizations
<details><summary><code>$client-><a href="/Seed/Organizations/OrganizationsClient.php">getOrganization</a>($tenantId, $organizationId) -> \Seed\Organizations\Types\Organization</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->organizations->getOrganization(
    tenantId: $tenantId,
    organizationId: $organizationId,
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

<details><summary><code>$client-><a href="/Seed/Organizations/OrganizationsClient.php">getOrganizationUser</a>($tenantId, $organizationId, $userId) -> \Seed\User\Types\User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->organizations->getOrganizationUser(
    tenantId: $tenantId,
    organizationId: $organizationId,
    userId: $userId,
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

<details><summary><code>$client-><a href="/Seed/Organizations/OrganizationsClient.php">searchOrganizations</a>($tenantId, $organizationId, $request) -> array</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->organizations->searchOrganizations(
    tenantId: $tenantId,
    organizationId: $organizationId,
    $request,
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

**$request:** `\Seed\Organizations\Requests\SearchOrganizationsRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## User
<details><summary><code>$client-><a href="/Seed/User/UserClient.php">getUser</a>($tenantId, $userId) -> \Seed\User\Types\User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->user->getUser(
    tenantId: $tenantId,
    userId: $userId,
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

<details><summary><code>$client-><a href="/Seed/User/UserClient.php">createUser</a>($tenantId, $request) -> \Seed\User\Types\User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->user->createUser(
    tenantId: $tenantId,
    $request,
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

**$request:** `\Seed\User\Types\User` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-><a href="/Seed/User/UserClient.php">updateUser</a>($tenantId, $userId, $request) -> \Seed\User\Types\User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->user->updateUser(
    tenantId: $tenantId,
    userId: $userId,
    $request,
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

**$request:** `\Seed\User\Requests\UpdateUserRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-><a href="/Seed/User/UserClient.php">searchUsers</a>($tenantId, $userId, $request) -> array</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->user->searchUsers(
    tenantId: $tenantId,
    userId: $userId,
    $request,
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

**$request:** `\Seed\User\Requests\SearchUsersRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
