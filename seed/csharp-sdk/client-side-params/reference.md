# Reference
## Service
<details><summary><code>client.Service.<a href="/src/SeedClientSideParams/Service/ServiceClient.cs">ListResourcesAsync</a>(ListResourcesRequest { ... }) -> IEnumerable<Resource></code></summary>
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

```csharp
await client.Service.ListResourcesAsync(
    new ListResourcesRequest
    {
        Page = 1,
        PerPage = 1,
        Sort = "created_at",
        Order = "desc",
        IncludeTotals = true,
        Fields = "fields",
        Search = "search",
    }
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

**request:** `ListResourcesRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.<a href="/src/SeedClientSideParams/Service/ServiceClient.cs">GetResourceAsync</a>(resourceId, GetResourceRequest { ... }) -> Resource</code></summary>
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

```csharp
await client.Service.GetResourceAsync(
    "resourceId",
    new GetResourceRequest { IncludeMetadata = true, Format = "json" }
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

**resourceId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `GetResourceRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.<a href="/src/SeedClientSideParams/Service/ServiceClient.cs">SearchResourcesAsync</a>(SearchResourcesRequest { ... }) -> SearchResponse</code></summary>
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

```csharp
await client.Service.SearchResourcesAsync(
    new SearchResourcesRequest
    {
        Limit = 1,
        Offset = 1,
        Query = "query",
        Filters = new Dictionary<string, object>()
        {
            {
                "filters",
                new Dictionary<object, object?>() { { "key", "value" } }
            },
        },
    }
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

**request:** `SearchResourcesRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.<a href="/src/SeedClientSideParams/Service/ServiceClient.cs">ListUsersAsync</a>(ListUsersRequest { ... }) -> PaginatedUserResponse</code></summary>
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

```csharp
await client.Service.ListUsersAsync(
    new ListUsersRequest
    {
        Page = 1,
        PerPage = 1,
        IncludeTotals = true,
        Sort = "sort",
        Connection = "connection",
        Q = "q",
        SearchEngine = "search_engine",
        Fields = "fields",
    }
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

**request:** `ListUsersRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.<a href="/src/SeedClientSideParams/Service/ServiceClient.cs">GetUserByIdAsync</a>(userId, GetUserRequest { ... }) -> User</code></summary>
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

```csharp
await client.Service.GetUserByIdAsync(
    "userId",
    new GetUserRequest { Fields = "fields", IncludeFields = true }
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

**userId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `GetUserRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.<a href="/src/SeedClientSideParams/Service/ServiceClient.cs">CreateUserAsync</a>(CreateUserRequest { ... }) -> User</code></summary>
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

```csharp
await client.Service.CreateUserAsync(
    new CreateUserRequest
    {
        Email = "email",
        EmailVerified = true,
        Username = "username",
        Password = "password",
        PhoneNumber = "phone_number",
        PhoneVerified = true,
        UserMetadata = new Dictionary<string, object>()
        {
            {
                "user_metadata",
                new Dictionary<object, object?>() { { "key", "value" } }
            },
        },
        AppMetadata = new Dictionary<string, object>()
        {
            {
                "app_metadata",
                new Dictionary<object, object?>() { { "key", "value" } }
            },
        },
        Connection = "connection",
    }
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

**request:** `CreateUserRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.<a href="/src/SeedClientSideParams/Service/ServiceClient.cs">UpdateUserAsync</a>(userId, UpdateUserRequest { ... }) -> User</code></summary>
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

```csharp
await client.Service.UpdateUserAsync(
    "userId",
    new UpdateUserRequest
    {
        Email = "email",
        EmailVerified = true,
        Username = "username",
        PhoneNumber = "phone_number",
        PhoneVerified = true,
        UserMetadata = new Dictionary<string, object>()
        {
            {
                "user_metadata",
                new Dictionary<object, object?>() { { "key", "value" } }
            },
        },
        AppMetadata = new Dictionary<string, object>()
        {
            {
                "app_metadata",
                new Dictionary<object, object?>() { { "key", "value" } }
            },
        },
        Password = "password",
        Blocked = true,
    }
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

**userId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `UpdateUserRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.<a href="/src/SeedClientSideParams/Service/ServiceClient.cs">DeleteUserAsync</a>(userId)</code></summary>
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

```csharp
await client.Service.DeleteUserAsync("userId");
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.<a href="/src/SeedClientSideParams/Service/ServiceClient.cs">ListConnectionsAsync</a>(ListConnectionsRequest { ... }) -> IEnumerable<Connection></code></summary>
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

```csharp
await client.Service.ListConnectionsAsync(
    new ListConnectionsRequest
    {
        Strategy = "strategy",
        Name = "name",
        Fields = "fields",
    }
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

**request:** `ListConnectionsRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.<a href="/src/SeedClientSideParams/Service/ServiceClient.cs">GetConnectionAsync</a>(connectionId, GetConnectionRequest { ... }) -> Connection</code></summary>
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

```csharp
await client.Service.GetConnectionAsync(
    "connectionId",
    new GetConnectionRequest { Fields = "fields" }
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

**connectionId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `GetConnectionRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.<a href="/src/SeedClientSideParams/Service/ServiceClient.cs">ListClientsAsync</a>(ListClientsRequest { ... }) -> PaginatedClientResponse</code></summary>
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

```csharp
await client.Service.ListClientsAsync(
    new ListClientsRequest
    {
        Fields = "fields",
        IncludeFields = true,
        Page = 1,
        PerPage = 1,
        IncludeTotals = true,
        IsGlobal = true,
        IsFirstParty = true,
        AppType = new List<string>() { "app_type", "app_type" },
    }
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

**request:** `ListClientsRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.<a href="/src/SeedClientSideParams/Service/ServiceClient.cs">GetClientAsync</a>(clientId, GetClientRequest { ... }) -> Client</code></summary>
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

```csharp
await client.Service.GetClientAsync(
    "clientId",
    new GetClientRequest { Fields = "fields", IncludeFields = true }
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

**clientId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `GetClientRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
