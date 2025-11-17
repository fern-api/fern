# Reference
## Service
<details><summary><code>client.service.<a href="/src/api/resources/service/client/Client.ts">listResources</a>({ ...params }) -> SeedClientSideParams.Resource[]</code></summary>
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

```typescript
await client.service.listResources({
    page: 1,
    per_page: 1,
    sort: "created_at",
    order: "desc",
    include_totals: true,
    fields: "fields",
    search: "search"
});

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

**request:** `SeedClientSideParams.ListResourcesRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client/Client.ts">getResource</a>(resourceId, { ...params }) -> SeedClientSideParams.Resource</code></summary>
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

```typescript
await client.service.getResource("resourceId", {
    include_metadata: true,
    format: "json"
});

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

**resourceId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedClientSideParams.GetResourceRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client/Client.ts">searchResources</a>({ ...params }) -> SeedClientSideParams.SearchResponse</code></summary>
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

```typescript
await client.service.searchResources({
    limit: 1,
    offset: 1,
    query: "query",
    filters: {
        "filters": {
            "key": "value"
        }
    }
});

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

**request:** `SeedClientSideParams.SearchResourcesRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client/Client.ts">listUsers</a>({ ...params }) -> SeedClientSideParams.PaginatedUserResponse</code></summary>
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

```typescript
await client.service.listUsers({
    page: 1,
    per_page: 1,
    include_totals: true,
    sort: "sort",
    connection: "connection",
    q: "q",
    search_engine: "search_engine",
    fields: "fields"
});

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

**request:** `SeedClientSideParams.ListUsersRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client/Client.ts">getUserById</a>(userId, { ...params }) -> SeedClientSideParams.User</code></summary>
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

```typescript
await client.service.getUserById("userId", {
    fields: "fields",
    include_fields: true
});

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

**userId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedClientSideParams.GetUserRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client/Client.ts">createUser</a>({ ...params }) -> SeedClientSideParams.User</code></summary>
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

```typescript
await client.service.createUser({
    email: "email",
    email_verified: true,
    username: "username",
    password: "password",
    phone_number: "phone_number",
    phone_verified: true,
    user_metadata: {
        "user_metadata": {
            "key": "value"
        }
    },
    app_metadata: {
        "app_metadata": {
            "key": "value"
        }
    },
    connection: "connection"
});

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

**request:** `SeedClientSideParams.CreateUserRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client/Client.ts">updateUser</a>(userId, { ...params }) -> SeedClientSideParams.User</code></summary>
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

```typescript
await client.service.updateUser("userId", {
    email: "email",
    email_verified: true,
    username: "username",
    phone_number: "phone_number",
    phone_verified: true,
    user_metadata: {
        "user_metadata": {
            "key": "value"
        }
    },
    app_metadata: {
        "app_metadata": {
            "key": "value"
        }
    },
    password: "password",
    blocked: true
});

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

**userId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedClientSideParams.UpdateUserRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client/Client.ts">deleteUser</a>(userId) -> void</code></summary>
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

```typescript
await client.service.deleteUser("userId");

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

**userId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client/Client.ts">listConnections</a>({ ...params }) -> SeedClientSideParams.Connection[]</code></summary>
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

```typescript
await client.service.listConnections({
    strategy: "strategy",
    name: "name",
    fields: "fields"
});

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

**request:** `SeedClientSideParams.ListConnectionsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client/Client.ts">getConnection</a>(connectionId, { ...params }) -> SeedClientSideParams.Connection</code></summary>
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

```typescript
await client.service.getConnection("connectionId", {
    fields: "fields"
});

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

**connectionId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedClientSideParams.GetConnectionRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client/Client.ts">listClients</a>({ ...params }) -> SeedClientSideParams.PaginatedClientResponse</code></summary>
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

```typescript
await client.service.listClients({
    fields: "fields",
    include_fields: true,
    page: 1,
    per_page: 1,
    include_totals: true,
    is_global: true,
    is_first_party: true,
    app_type: ["app_type", "app_type"]
});

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

**request:** `SeedClientSideParams.ListClientsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client/Client.ts">getClient</a>(clientId, { ...params }) -> SeedClientSideParams.Client</code></summary>
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

```typescript
await client.service.getClient("clientId", {
    fields: "fields",
    include_fields: true
});

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

**clientId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedClientSideParams.GetClientRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
