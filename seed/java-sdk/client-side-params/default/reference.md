# Reference
## Service
<details><summary><code>client.service.listresources() -> List&amp;lt;Resource&amp;gt;</code></summary>
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

```java
client.service().listresources(
    ServiceListResourcesRequest
        .builder()
        .page(1)
        .perPage(1)
        .sort("sort")
        .order("order")
        .includeTotals(true)
        .build()
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

**page:** `Integer` — Zero-indexed page number
    
</dd>
</dl>

<dl>
<dd>

**perPage:** `Integer` — Number of items per page
    
</dd>
</dl>

<dl>
<dd>

**sort:** `String` — Sort field
    
</dd>
</dl>

<dl>
<dd>

**order:** `String` — Sort order (asc or desc)
    
</dd>
</dl>

<dl>
<dd>

**includeTotals:** `Boolean` — Whether to include total count
    
</dd>
</dl>

<dl>
<dd>

**fields:** `Optional<String>` — Comma-separated list of fields to include
    
</dd>
</dl>

<dl>
<dd>

**search:** `Optional<String>` — Search query
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.getresource(resourceId) -> Resource</code></summary>
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

```java
client.service().getresource(
    "resourceId",
    ServiceGetResourceRequest
        .builder()
        .includeMetadata(true)
        .format("format")
        .build()
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

**resourceId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**includeMetadata:** `Boolean` — Include metadata in response
    
</dd>
</dl>

<dl>
<dd>

**format:** `String` — Response format
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.searchresources(request) -> SearchResponse</code></summary>
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

```java
client.service().searchresources(
    ServiceSearchResourcesRequest
        .builder()
        .limit(1)
        .offset(1)
        .build()
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

**limit:** `Integer` — Maximum results to return
    
</dd>
</dl>

<dl>
<dd>

**offset:** `Integer` — Offset for pagination
    
</dd>
</dl>

<dl>
<dd>

**query:** `Optional<String>` — Search query text
    
</dd>
</dl>

<dl>
<dd>

**filters:** `Optional<Map<String, Object>>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.listusers() -> PaginatedUserResponse</code></summary>
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

```java
client.service().listusers(
    ServiceListUsersRequest
        .builder()
        .build()
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

**page:** `Optional<Integer>` — Page index of the results to return. First page is 0.
    
</dd>
</dl>

<dl>
<dd>

**perPage:** `Optional<Integer>` — Number of results per page.
    
</dd>
</dl>

<dl>
<dd>

**includeTotals:** `Optional<Boolean>` — Return results inside an object that contains the total result count (true) or as a direct array of results (false, default).
    
</dd>
</dl>

<dl>
<dd>

**sort:** `Optional<String>` — Field to sort by. Use field:order where order is 1 for ascending and -1 for descending.
    
</dd>
</dl>

<dl>
<dd>

**connection:** `Optional<String>` — Connection filter
    
</dd>
</dl>

<dl>
<dd>

**q:** `Optional<String>` — Query string following Lucene query string syntax
    
</dd>
</dl>

<dl>
<dd>

**searchEngine:** `Optional<String>` — Search engine version (v1, v2, or v3)
    
</dd>
</dl>

<dl>
<dd>

**fields:** `Optional<String>` — Comma-separated list of fields to include or exclude
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.createuser(request) -> User</code></summary>
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

```java
client.service().createuser(
    CreateUserRequest
        .builder()
        .email("email")
        .connection("connection")
        .build()
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

**email:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**emailVerified:** `Optional<Boolean>` 
    
</dd>
</dl>

<dl>
<dd>

**username:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**password:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**phoneNumber:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**phoneVerified:** `Optional<Boolean>` 
    
</dd>
</dl>

<dl>
<dd>

**userMetadata:** `Optional<Map<String, Object>>` 
    
</dd>
</dl>

<dl>
<dd>

**appMetadata:** `Optional<Map<String, Object>>` 
    
</dd>
</dl>

<dl>
<dd>

**connection:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.getuserbyid(userId) -> User</code></summary>
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

```java
client.service().getuserbyid(
    "userId",
    ServiceGetUserByIdRequest
        .builder()
        .build()
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

**userId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**fields:** `Optional<String>` — Comma-separated list of fields to include or exclude
    
</dd>
</dl>

<dl>
<dd>

**includeFields:** `Optional<Boolean>` — true to include the fields specified, false to exclude them
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.deleteuser(userId)</code></summary>
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

```java
client.service().deleteuser(
    "userId",
    ServiceDeleteUserRequest
        .builder()
        .build()
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

**userId:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.updateuser(userId, request) -> User</code></summary>
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

```java
client.service().updateuser(
    "userId",
    UpdateUserRequest
        .builder()
        .build()
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

**userId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**email:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**emailVerified:** `Optional<Boolean>` 
    
</dd>
</dl>

<dl>
<dd>

**username:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**phoneNumber:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**phoneVerified:** `Optional<Boolean>` 
    
</dd>
</dl>

<dl>
<dd>

**userMetadata:** `Optional<Map<String, Object>>` 
    
</dd>
</dl>

<dl>
<dd>

**appMetadata:** `Optional<Map<String, Object>>` 
    
</dd>
</dl>

<dl>
<dd>

**password:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**blocked:** `Optional<Boolean>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.listconnections() -> List&amp;lt;Connection&amp;gt;</code></summary>
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

```java
client.service().listconnections(
    ServiceListConnectionsRequest
        .builder()
        .build()
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

**strategy:** `Optional<String>` — Filter by strategy type (e.g., auth0, google-oauth2, samlp)
    
</dd>
</dl>

<dl>
<dd>

**name:** `Optional<String>` — Filter by connection name
    
</dd>
</dl>

<dl>
<dd>

**fields:** `Optional<String>` — Comma-separated list of fields to include
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.getconnection(connectionId) -> Connection</code></summary>
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

```java
client.service().getconnection(
    "connectionId",
    ServiceGetConnectionRequest
        .builder()
        .build()
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

**connectionId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**fields:** `Optional<String>` — Comma-separated list of fields to include
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.listclients() -> PaginatedClientResponse</code></summary>
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

```java
client.service().listclients(
    ServiceListClientsRequest
        .builder()
        .build()
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

**fields:** `Optional<String>` — Comma-separated list of fields to include
    
</dd>
</dl>

<dl>
<dd>

**includeFields:** `Optional<Boolean>` — Whether specified fields are included or excluded
    
</dd>
</dl>

<dl>
<dd>

**page:** `Optional<Integer>` — Page number (zero-based)
    
</dd>
</dl>

<dl>
<dd>

**perPage:** `Optional<Integer>` — Number of results per page
    
</dd>
</dl>

<dl>
<dd>

**includeTotals:** `Optional<Boolean>` — Include total count in response
    
</dd>
</dl>

<dl>
<dd>

**isGlobal:** `Optional<Boolean>` — Filter by global clients
    
</dd>
</dl>

<dl>
<dd>

**isFirstParty:** `Optional<Boolean>` — Filter by first party clients
    
</dd>
</dl>

<dl>
<dd>

**appType:** `Optional<List<String>>` — Filter by application type (spa, native, regular_web, non_interactive)
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.getclient(clientId) -> Client</code></summary>
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

```java
client.service().getclient(
    "clientId",
    ServiceGetClientRequest
        .builder()
        .build()
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

**clientId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**fields:** `Optional<String>` — Comma-separated list of fields to include
    
</dd>
</dl>

<dl>
<dd>

**includeFields:** `Optional<Boolean>` — Whether specified fields are included or excluded
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

