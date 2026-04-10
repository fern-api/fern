# Reference
## Nullableoptional
<details><summary><code>$client-&gt;nullableoptional-&gt;getuser($userId) -> ?UserResponse</code></summary>
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
$client->nullableoptional->getuser(
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

<details><summary><code>$client-&gt;nullableoptional-&gt;updateuser($userId, $request) -> ?UserResponse</code></summary>
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
$client->nullableoptional->updateuser(
    'userId',
    new UpdateUserRequest([]),
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

**$username:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$email:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$phone:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$address:** `?Address` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;nullableoptional-&gt;listusers($request) -> ?array</code></summary>
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
$client->nullableoptional->listusers(
    new NullableOptionalListUsersRequest([]),
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

<details><summary><code>$client-&gt;nullableoptional-&gt;createuser($request) -> ?UserResponse</code></summary>
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
$client->nullableoptional->createuser(
    new CreateUserRequest([
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

**$email:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$phone:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$address:** `?Address` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;nullableoptional-&gt;searchusers($request) -> ?array</code></summary>
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
$client->nullableoptional->searchusers(
    new NullableOptionalSearchUsersRequest([
        'query' => 'query',
        'department' => 'department',
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

<details><summary><code>$client-&gt;nullableoptional-&gt;createcomplexprofile($request) -> ?ComplexProfile</code></summary>
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
$client->nullableoptional->createcomplexprofile(
    new ComplexProfile([
        'id' => 'id',
        'nullableRole' => UserRole::Admin->value,
        'nullableStatus' => UserStatus::Active->value,
        'nullableNotification' => new NotificationMethodZero([
            'emailAddress' => 'emailAddress',
            'subject' => 'subject',
            'type' => NotificationMethodZeroType::Email->value,
        ]),
        'nullableSearchResult' => new SearchResultZero([
            'id' => 'id',
            'username' => 'username',
            'createdAt' => new DateTime('2024-01-15T09:30:00Z'),
            'type' => SearchResultZeroType::User->value,
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

**$request:** `ComplexProfile` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;nullableoptional-&gt;getcomplexprofile($profileId) -> ?ComplexProfile</code></summary>
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
$client->nullableoptional->getcomplexprofile(
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

<details><summary><code>$client-&gt;nullableoptional-&gt;updatecomplexprofile($profileId, $request) -> ?ComplexProfile</code></summary>
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
$client->nullableoptional->updatecomplexprofile(
    'profileId',
    new NullableOptionalUpdateComplexProfileRequest([]),
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

**$nullableNotification:** `NotificationMethodZero|NotificationMethodOne|NotificationMethodTwo|null` 
    
</dd>
</dl>

<dl>
<dd>

**$nullableSearchResult:** `SearchResultZero|SearchResultOne|SearchResultTwo|null` 
    
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

<details><summary><code>$client-&gt;nullableoptional-&gt;testdeserialization($request) -> ?DeserializationTestResponse</code></summary>
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
$client->nullableoptional->testdeserialization(
    new DeserializationTestRequest([
        'requiredString' => 'requiredString',
        'nullableEnum' => UserRole::Admin->value,
        'nullableUnion' => new NotificationMethodZero([
            'emailAddress' => 'emailAddress',
            'subject' => 'subject',
            'type' => NotificationMethodZeroType::Email->value,
        ]),
        'nullableObject' => new Address([
            'street' => 'street',
            'zipCode' => 'zipCode',
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

<details><summary><code>$client-&gt;nullableoptional-&gt;filterbyrole($request) -> ?array</code></summary>
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
$client->nullableoptional->filterbyrole(
    new NullableOptionalFilterByRoleRequest([
        'role' => UserRole::Admin->value,
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

**$role:** `string` 
    
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

<details><summary><code>$client-&gt;nullableoptional-&gt;getnotificationsettings($userId) -> NotificationMethodZero|NotificationMethodOne|NotificationMethodTwo|null</code></summary>
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
$client->nullableoptional->getnotificationsettings(
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

<details><summary><code>$client-&gt;nullableoptional-&gt;updatetags($userId, $request) -> ?array</code></summary>
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
$client->nullableoptional->updatetags(
    'userId',
    new NullableOptionalUpdateTagsRequest([]),
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

<details><summary><code>$client-&gt;nullableoptional-&gt;getsearchresults($request) -> ?array</code></summary>
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
$client->nullableoptional->getsearchresults(
    new NullableOptionalGetSearchResultsRequest([
        'query' => 'query',
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

