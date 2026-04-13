# Reference
## Service
<details><summary><code>$client-&gt;service-&gt;listresources($request) -> ?array</code></summary>
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
$client->service->listresources(
    new ServiceListResourcesRequest([
        'page' => 1,
        'perPage' => 1,
        'sort' => 'sort',
        'order' => 'order',
        'includeTotals' => true,
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

<details><summary><code>$client-&gt;service-&gt;getresource($resourceId, $request) -> ?Resource</code></summary>
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
$client->service->getresource(
    'resourceId',
    new ServiceGetResourceRequest([
        'includeMetadata' => true,
        'format' => 'format',
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

<details><summary><code>$client-&gt;service-&gt;searchresources($request) -> ?SearchResponse</code></summary>
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
$client->service->searchresources(
    new ServiceSearchResourcesRequest([
        'limit' => 1,
        'offset' => 1,
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

<details><summary><code>$client-&gt;service-&gt;listusers($request) -> ?PaginatedUserResponse</code></summary>
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
$client->service->listusers(
    new ServiceListUsersRequest([]),
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

<details><summary><code>$client-&gt;service-&gt;createuser($request) -> ?User</code></summary>
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
$client->service->createuser(
    new CreateUserRequest([
        'email' => 'email',
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

**$email:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$emailVerified:** `?bool` 
    
</dd>
</dl>

<dl>
<dd>

**$username:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$password:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$phoneNumber:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$phoneVerified:** `?bool` 
    
</dd>
</dl>

<dl>
<dd>

**$userMetadata:** `?array` 
    
</dd>
</dl>

<dl>
<dd>

**$appMetadata:** `?array` 
    
</dd>
</dl>

<dl>
<dd>

**$connection:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;service-&gt;getuserbyid($userId, $request) -> ?User</code></summary>
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
$client->service->getuserbyid(
    'userId',
    new ServiceGetUserByIdRequest([]),
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

<details><summary><code>$client-&gt;service-&gt;deleteuser($userId)</code></summary>
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
$client->service->deleteuser(
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

<details><summary><code>$client-&gt;service-&gt;updateuser($userId, $request) -> ?User</code></summary>
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
$client->service->updateuser(
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

**$email:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$emailVerified:** `?bool` 
    
</dd>
</dl>

<dl>
<dd>

**$username:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$phoneNumber:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$phoneVerified:** `?bool` 
    
</dd>
</dl>

<dl>
<dd>

**$userMetadata:** `?array` 
    
</dd>
</dl>

<dl>
<dd>

**$appMetadata:** `?array` 
    
</dd>
</dl>

<dl>
<dd>

**$password:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$blocked:** `?bool` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;service-&gt;listconnections($request) -> ?array</code></summary>
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
$client->service->listconnections(
    new ServiceListConnectionsRequest([]),
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

<details><summary><code>$client-&gt;service-&gt;getconnection($connectionId, $request) -> ?Connection</code></summary>
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
$client->service->getconnection(
    'connectionId',
    new ServiceGetConnectionRequest([]),
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

<details><summary><code>$client-&gt;service-&gt;listclients($request) -> ?PaginatedClientResponse</code></summary>
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
$client->service->listclients(
    new ServiceListClientsRequest([]),
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

<details><summary><code>$client-&gt;service-&gt;getclient($clientId, $request) -> ?Client</code></summary>
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
$client->service->getclient(
    'clientId',
    new ServiceGetClientRequest([]),
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

