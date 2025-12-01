# Reference
## Service
<details><summary><code>$client->service->listResources($request) -> array</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List resources with pagination
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
$client->service->listResources(
    new ListResourcesRequest([
        'page' => 1,
        'perPage' => 1,
        'sort' => 'created_at',
        'order' => 'desc',
        'includeTotals' => true,
        'fields' => 'fields',
        'search' => 'search',
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

**$page:** `int` — Zero-indexed page number
    
</dd>
</dl>

<dl>
<dd>

**$perPage:** `int` — Number of items per page
    
</dd>
</dl>

<dl>
<dd>

**$sort:** `string` — Sort field
    
</dd>
</dl>

<dl>
<dd>

**$order:** `string` — Sort order (asc or desc)
    
</dd>
</dl>

<dl>
<dd>

**$includeTotals:** `bool` — Whether to include total count
    
</dd>
</dl>

<dl>
<dd>

**$fields:** `?string` — Comma-separated list of fields to include
    
</dd>
</dl>

<dl>
<dd>

**$search:** `?string` — Search query
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->service->getResource($resourceId, $request) -> Resource</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get a single resource
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
$client->service->getResource(
    'resourceId',
    new GetResourceRequest([
        'includeMetadata' => true,
        'format' => 'json',
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

**$resourceId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$includeMetadata:** `bool` — Include metadata in response
    
</dd>
</dl>

<dl>
<dd>

**$format:** `string` — Response format
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->service->searchResources($request) -> SearchResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Search resources with complex parameters
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
$client->service->searchResources(
    new SearchResourcesRequest([
        'limit' => 1,
        'offset' => 1,
        'query' => 'query',
        'filters' => [
            'filters' => [
                'key' => "value",
            ],
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

**$limit:** `int` — Maximum results to return
    
</dd>
</dl>

<dl>
<dd>

**$offset:** `int` — Offset for pagination
    
</dd>
</dl>

<dl>
<dd>

**$query:** `?string` — Search query text
    
</dd>
</dl>

<dl>
<dd>

**$filters:** `?array` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->service->listUsers($request) -> PaginatedUserResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List or search for users
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
$client->service->listUsers(
    new ListUsersRequest([
        'page' => 1,
        'perPage' => 1,
        'includeTotals' => true,
        'sort' => 'sort',
        'connection' => 'connection',
        'q' => 'q',
        'searchEngine' => 'search_engine',
        'fields' => 'fields',
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

**$page:** `?int` — Page index of the results to return. First page is 0.
    
</dd>
</dl>

<dl>
<dd>

**$perPage:** `?int` — Number of results per page.
    
</dd>
</dl>

<dl>
<dd>

**$includeTotals:** `?bool` — Return results inside an object that contains the total result count (true) or as a direct array of results (false, default).
    
</dd>
</dl>

<dl>
<dd>

**$sort:** `?string` — Field to sort by. Use field:order where order is 1 for ascending and -1 for descending.
    
</dd>
</dl>

<dl>
<dd>

**$connection:** `?string` — Connection filter
    
</dd>
</dl>

<dl>
<dd>

**$q:** `?string` — Query string following Lucene query string syntax
    
</dd>
</dl>

<dl>
<dd>

**$searchEngine:** `?string` — Search engine version (v1, v2, or v3)
    
</dd>
</dl>

<dl>
<dd>

**$fields:** `?string` — Comma-separated list of fields to include or exclude
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->service->getUserById($userId, $request) -> User</code></summary>
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
$client->service->getUserById(
    'userId',
    new GetUserRequest([
        'fields' => 'fields',
        'includeFields' => true,
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

**$fields:** `?string` — Comma-separated list of fields to include or exclude
    
</dd>
</dl>

<dl>
<dd>

**$includeFields:** `?bool` — true to include the fields specified, false to exclude them
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->service->createUser($request) -> User</code></summary>
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
$client->service->createUser(
    new CreateUserRequest([
        'email' => 'email',
        'emailVerified' => true,
        'username' => 'username',
        'password' => 'password',
        'phoneNumber' => 'phone_number',
        'phoneVerified' => true,
        'userMetadata' => [
            'user_metadata' => [
                'key' => "value",
            ],
        ],
        'appMetadata' => [
            'app_metadata' => [
                'key' => "value",
            ],
        ],
        'connection' => 'connection',
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

<details><summary><code>$client->service->updateUser($userId, $request) -> User</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Update a user
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
$client->service->updateUser(
    'userId',
    new UpdateUserRequest([
        'email' => 'email',
        'emailVerified' => true,
        'username' => 'username',
        'phoneNumber' => 'phone_number',
        'phoneVerified' => true,
        'userMetadata' => [
            'user_metadata' => [
                'key' => "value",
            ],
        ],
        'appMetadata' => [
            'app_metadata' => [
                'key' => "value",
            ],
        ],
        'password' => 'password',
        'blocked' => true,
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

<details><summary><code>$client->service->deleteUser($userId)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Delete a user
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
$client->service->deleteUser(
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

<details><summary><code>$client->service->listConnections($request) -> array</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List all connections
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
$client->service->listConnections(
    new ListConnectionsRequest([
        'strategy' => 'strategy',
        'name' => 'name',
        'fields' => 'fields',
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

**$strategy:** `?string` — Filter by strategy type (e.g., auth0, google-oauth2, samlp)
    
</dd>
</dl>

<dl>
<dd>

**$name:** `?string` — Filter by connection name
    
</dd>
</dl>

<dl>
<dd>

**$fields:** `?string` — Comma-separated list of fields to include
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->service->getConnection($connectionId, $request) -> Connection</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get a connection by ID
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
$client->service->getConnection(
    'connectionId',
    new GetConnectionRequest([
        'fields' => 'fields',
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

**$connectionId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$fields:** `?string` — Comma-separated list of fields to include
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->service->listClients($request) -> PaginatedClientResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List all clients/applications
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
$client->service->listClients(
    new ListClientsRequest([
        'fields' => 'fields',
        'includeFields' => true,
        'page' => 1,
        'perPage' => 1,
        'includeTotals' => true,
        'isGlobal' => true,
        'isFirstParty' => true,
        'appType' => [
            'app_type',
            'app_type',
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

**$fields:** `?string` — Comma-separated list of fields to include
    
</dd>
</dl>

<dl>
<dd>

**$includeFields:** `?bool` — Whether specified fields are included or excluded
    
</dd>
</dl>

<dl>
<dd>

**$page:** `?int` — Page number (zero-based)
    
</dd>
</dl>

<dl>
<dd>

**$perPage:** `?int` — Number of results per page
    
</dd>
</dl>

<dl>
<dd>

**$includeTotals:** `?bool` — Include total count in response
    
</dd>
</dl>

<dl>
<dd>

**$isGlobal:** `?bool` — Filter by global clients
    
</dd>
</dl>

<dl>
<dd>

**$isFirstParty:** `?bool` — Filter by first party clients
    
</dd>
</dl>

<dl>
<dd>

**$appType:** `?array` — Filter by application type (spa, native, regular_web, non_interactive)
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->service->getClient($clientId, $request) -> Client</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get a client by ID
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
$client->service->getClient(
    'clientId',
    new GetClientRequest([
        'fields' => 'fields',
        'includeFields' => true,
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

**$clientId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$fields:** `?string` — Comma-separated list of fields to include
    
</dd>
</dl>

<dl>
<dd>

**$includeFields:** `?bool` — Whether specified fields are included or excluded
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
