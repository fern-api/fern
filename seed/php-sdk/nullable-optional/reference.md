# Reference
## NullableOptional
<details><summary><code>$client->nullableOptional->getUser($userId) -> UserResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get a user by ID
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
$client->nullableOptional->getUser(
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
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->nullableOptional->createUser($request) -> UserResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Create a new user
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
$client->nullableOptional->createUser(
    new CreateUserRequest([
        'username' => 'username',
        'email' => 'email',
        'phone' => 'phone',
        'address' => new Address([
            'street' => 'street',
            'city' => 'city',
            'state' => 'state',
            'zipCode' => 'zipCode',
            'country' => 'country',
            'buildingId' => 'buildingId',
            'tenantId' => 'tenantId',
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

**$request:** `CreateUserRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->nullableOptional->updateUser($userId, $request) -> UserResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Update a user (partial update)
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
$client->nullableOptional->updateUser(
    'userId',
    new UpdateUserRequest([
        'username' => 'username',
        'email' => 'email',
        'phone' => 'phone',
        'address' => new Address([
            'street' => 'street',
            'city' => 'city',
            'state' => 'state',
            'zipCode' => 'zipCode',
            'country' => 'country',
            'buildingId' => 'buildingId',
            'tenantId' => 'tenantId',
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

**$userId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$request:** `UpdateUserRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->nullableOptional->listUsers($request) -> array</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List all users
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
$client->nullableOptional->listUsers(
    new ListUsersRequest([
        'limit' => 1,
        'offset' => 1,
        'includeDeleted' => true,
        'sortBy' => 'sortBy',
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

**$limit:** `?int` 
    
</dd>
</dl>

<dl>
<dd>

**$offset:** `?int` 
    
</dd>
</dl>

<dl>
<dd>

**$includeDeleted:** `?bool` 
    
</dd>
</dl>

<dl>
<dd>

**$sortBy:** `?string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->nullableOptional->searchUsers($request) -> array</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Search users
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
$client->nullableOptional->searchUsers(
    new SearchUsersRequest([
        'query' => 'query',
        'department' => 'department',
        'role' => 'role',
        'isActive' => true,
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

**$query:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$department:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$role:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$isActive:** `?bool` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->nullableOptional->createComplexProfile($request) -> ComplexProfile</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Create a complex profile to test nullable enums and unions
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
$client->nullableOptional->createComplexProfile(
    new ComplexProfile([
        'id' => 'id',
        'nullableRole' => UserRole::Admin->value,
        'optionalRole' => UserRole::Admin->value,
        'optionalNullableRole' => UserRole::Admin->value,
        'nullableStatus' => UserStatus::Active->value,
        'optionalStatus' => UserStatus::Active->value,
        'optionalNullableStatus' => UserStatus::Active->value,
        'nullableNotification' => NotificationMethod::email(new EmailNotification([
            'emailAddress' => 'emailAddress',
            'subject' => 'subject',
            'htmlContent' => 'htmlContent',
        ])),
        'optionalNotification' => NotificationMethod::email(new EmailNotification([
            'emailAddress' => 'emailAddress',
            'subject' => 'subject',
            'htmlContent' => 'htmlContent',
        ])),
        'optionalNullableNotification' => NotificationMethod::email(new EmailNotification([
            'emailAddress' => 'emailAddress',
            'subject' => 'subject',
            'htmlContent' => 'htmlContent',
        ])),
        'nullableSearchResult' => SearchResult::user(new UserResponse([
            'id' => 'id',
            'username' => 'username',
            'email' => 'email',
            'phone' => 'phone',
            'createdAt' => new DateTime('2024-01-15T09:30:00Z'),
            'updatedAt' => new DateTime('2024-01-15T09:30:00Z'),
            'address' => new Address([
                'street' => 'street',
                'city' => 'city',
                'state' => 'state',
                'zipCode' => 'zipCode',
                'country' => 'country',
                'buildingId' => 'buildingId',
                'tenantId' => 'tenantId',
            ]),
        ])),
        'optionalSearchResult' => SearchResult::user(new UserResponse([
            'id' => 'id',
            'username' => 'username',
            'email' => 'email',
            'phone' => 'phone',
            'createdAt' => new DateTime('2024-01-15T09:30:00Z'),
            'updatedAt' => new DateTime('2024-01-15T09:30:00Z'),
            'address' => new Address([
                'street' => 'street',
                'city' => 'city',
                'state' => 'state',
                'zipCode' => 'zipCode',
                'country' => 'country',
                'buildingId' => 'buildingId',
                'tenantId' => 'tenantId',
            ]),
        ])),
        'nullableArray' => [
            'nullableArray',
            'nullableArray',
        ],
        'optionalArray' => [
            'optionalArray',
            'optionalArray',
        ],
        'optionalNullableArray' => [
            'optionalNullableArray',
            'optionalNullableArray',
        ],
        'nullableListOfNullables' => [
            'nullableListOfNullables',
            'nullableListOfNullables',
        ],
        'nullableMapOfNullables' => [
            'nullableMapOfNullables' => new Address([
                'street' => 'street',
                'city' => 'city',
                'state' => 'state',
                'zipCode' => 'zipCode',
                'country' => 'country',
                'buildingId' => 'buildingId',
                'tenantId' => 'tenantId',
            ]),
        ],
        'nullableListOfUnions' => [
            NotificationMethod::email(new EmailNotification([
                'emailAddress' => 'emailAddress',
                'subject' => 'subject',
                'htmlContent' => 'htmlContent',
            ])),
            NotificationMethod::email(new EmailNotification([
                'emailAddress' => 'emailAddress',
                'subject' => 'subject',
                'htmlContent' => 'htmlContent',
            ])),
        ],
        'optionalMapOfEnums' => [
            'optionalMapOfEnums' => UserRole::Admin->value,
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

**$request:** `ComplexProfile` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->nullableOptional->getComplexProfile($profileId) -> ComplexProfile</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get a complex profile by ID
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
$client->nullableOptional->getComplexProfile(
    'profileId',
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

**$profileId:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->nullableOptional->updateComplexProfile($profileId, $request) -> ComplexProfile</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Update complex profile to test nullable field updates
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
$client->nullableOptional->updateComplexProfile(
    'profileId',
    new UpdateComplexProfileRequest([
        'nullableRole' => UserRole::Admin->value,
        'nullableStatus' => UserStatus::Active->value,
        'nullableNotification' => NotificationMethod::email(new EmailNotification([
            'emailAddress' => 'emailAddress',
            'subject' => 'subject',
            'htmlContent' => 'htmlContent',
        ])),
        'nullableSearchResult' => SearchResult::user(new UserResponse([
            'id' => 'id',
            'username' => 'username',
            'email' => 'email',
            'phone' => 'phone',
            'createdAt' => new DateTime('2024-01-15T09:30:00Z'),
            'updatedAt' => new DateTime('2024-01-15T09:30:00Z'),
            'address' => new Address([
                'street' => 'street',
                'city' => 'city',
                'state' => 'state',
                'zipCode' => 'zipCode',
                'country' => 'country',
                'buildingId' => 'buildingId',
                'tenantId' => 'tenantId',
            ]),
        ])),
        'nullableArray' => [
            'nullableArray',
            'nullableArray',
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

**$profileId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$nullableRole:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$nullableStatus:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$nullableNotification:** `?NotificationMethod` 
    
</dd>
</dl>

<dl>
<dd>

**$nullableSearchResult:** `?SearchResult` 
    
</dd>
</dl>

<dl>
<dd>

**$nullableArray:** `?array` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->nullableOptional->testDeserialization($request) -> DeserializationTestResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Test endpoint for validating null deserialization
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
$client->nullableOptional->testDeserialization(
    new DeserializationTestRequest([
        'requiredString' => 'requiredString',
        'nullableString' => 'nullableString',
        'optionalString' => 'optionalString',
        'optionalNullableString' => 'optionalNullableString',
        'nullableEnum' => UserRole::Admin->value,
        'optionalEnum' => UserStatus::Active->value,
        'nullableUnion' => NotificationMethod::email(new EmailNotification([
            'emailAddress' => 'emailAddress',
            'subject' => 'subject',
            'htmlContent' => 'htmlContent',
        ])),
        'optionalUnion' => SearchResult::user(new UserResponse([
            'id' => 'id',
            'username' => 'username',
            'email' => 'email',
            'phone' => 'phone',
            'createdAt' => new DateTime('2024-01-15T09:30:00Z'),
            'updatedAt' => new DateTime('2024-01-15T09:30:00Z'),
            'address' => new Address([
                'street' => 'street',
                'city' => 'city',
                'state' => 'state',
                'zipCode' => 'zipCode',
                'country' => 'country',
                'buildingId' => 'buildingId',
                'tenantId' => 'tenantId',
            ]),
        ])),
        'nullableList' => [
            'nullableList',
            'nullableList',
        ],
        'nullableMap' => [
            'nullableMap' => 1,
        ],
        'nullableObject' => new Address([
            'street' => 'street',
            'city' => 'city',
            'state' => 'state',
            'zipCode' => 'zipCode',
            'country' => 'country',
            'buildingId' => 'buildingId',
            'tenantId' => 'tenantId',
        ]),
        'optionalObject' => new Organization([
            'id' => 'id',
            'name' => 'name',
            'domain' => 'domain',
            'employeeCount' => 1,
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

**$request:** `DeserializationTestRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->nullableOptional->filterByRole($request) -> array</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Filter users by role with nullable enum
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
$client->nullableOptional->filterByRole(
    new FilterByRoleRequest([
        'role' => UserRole::Admin->value,
        'status' => UserStatus::Active->value,
        'secondaryRole' => UserRole::Admin->value,
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

**$role:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$status:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$secondaryRole:** `?string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->nullableOptional->getNotificationSettings($userId) -> ?NotificationMethod</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get notification settings which may be null
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
$client->nullableOptional->getNotificationSettings(
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
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->nullableOptional->updateTags($userId, $request) -> array</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Update tags to test array handling
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
$client->nullableOptional->updateTags(
    'userId',
    new UpdateTagsRequest([
        'tags' => [
            'tags',
            'tags',
        ],
        'categories' => [
            'categories',
            'categories',
        ],
        'labels' => [
            'labels',
            'labels',
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

**$userId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$tags:** `?array` 
    
</dd>
</dl>

<dl>
<dd>

**$categories:** `?array` 
    
</dd>
</dl>

<dl>
<dd>

**$labels:** `?array` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->nullableOptional->getSearchResults($request) -> ?array</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get search results with nullable unions
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
$client->nullableOptional->getSearchResults(
    new SearchRequest([
        'query' => 'query',
        'filters' => [
            'filters' => 'filters',
        ],
        'includeTypes' => [
            'includeTypes',
            'includeTypes',
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

**$query:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$filters:** `?array` 
    
</dd>
</dl>

<dl>
<dd>

**$includeTypes:** `?array` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
