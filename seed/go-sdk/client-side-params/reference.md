# Reference
## Service
<details><summary><code>client.Service.ListResources() -> []*fern.Resource</code></summary>
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

```go
client.Service.ListResources(
        context.TODO(),
        &fern.ListResourcesRequest{
            Page: 1,
            PerPage: 1,
            Sort: "created_at",
            Order: "desc",
            IncludeTotals: true,
            Fields: fern.String(
                "fields",
            ),
            Search: fern.String(
                "search",
            ),
        },
    )
}
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

**page:** `int` — Zero-indexed page number
    
</dd>
</dl>

<dl>
<dd>

**perPage:** `int` — Number of items per page
    
</dd>
</dl>

<dl>
<dd>

**sort:** `string` — Sort field
    
</dd>
</dl>

<dl>
<dd>

**order:** `string` — Sort order (asc or desc)
    
</dd>
</dl>

<dl>
<dd>

**includeTotals:** `bool` — Whether to include total count
    
</dd>
</dl>

<dl>
<dd>

**fields:** `*string` — Comma-separated list of fields to include
    
</dd>
</dl>

<dl>
<dd>

**search:** `*string` — Search query
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.GetResource(ResourceId) -> *fern.Resource</code></summary>
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

```go
client.Service.GetResource(
        context.TODO(),
        "resourceId",
        &fern.GetResourceRequest{
            IncludeMetadata: true,
            Format: "json",
        },
    )
}
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

**includeMetadata:** `bool` — Include metadata in response
    
</dd>
</dl>

<dl>
<dd>

**format:** `string` — Response format
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.SearchResources(request) -> *fern.SearchResponse</code></summary>
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

```go
client.Service.SearchResources(
        context.TODO(),
        &fern.SearchResourcesRequest{
            Limit: 1,
            Offset: 1,
            Query: fern.String(
                "query",
            ),
            Filters: map[string]any{
                "filters": map[string]any{
                    "key": "value",
                },
            },
        },
    )
}
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

**limit:** `int` — Maximum results to return
    
</dd>
</dl>

<dl>
<dd>

**offset:** `int` — Offset for pagination
    
</dd>
</dl>

<dl>
<dd>

**query:** `*string` — Search query text
    
</dd>
</dl>

<dl>
<dd>

**filters:** `map[string]any` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.ListUsers() -> *fern.PaginatedUserResponse</code></summary>
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

```go
client.Service.ListUsers(
        context.TODO(),
        &fern.ListUsersRequest{
            Page: fern.Int(
                1,
            ),
            PerPage: fern.Int(
                1,
            ),
            IncludeTotals: fern.Bool(
                true,
            ),
            Sort: fern.String(
                "sort",
            ),
            Connection: fern.String(
                "connection",
            ),
            Q: fern.String(
                "q",
            ),
            SearchEngine: fern.String(
                "search_engine",
            ),
            Fields: fern.String(
                "fields",
            ),
        },
    )
}
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

**page:** `*int` — Page index of the results to return. First page is 0.
    
</dd>
</dl>

<dl>
<dd>

**perPage:** `*int` — Number of results per page.
    
</dd>
</dl>

<dl>
<dd>

**includeTotals:** `*bool` — Return results inside an object that contains the total result count (true) or as a direct array of results (false, default).
    
</dd>
</dl>

<dl>
<dd>

**sort:** `*string` — Field to sort by. Use field:order where order is 1 for ascending and -1 for descending.
    
</dd>
</dl>

<dl>
<dd>

**connection:** `*string` — Connection filter
    
</dd>
</dl>

<dl>
<dd>

**q:** `*string` — Query string following Lucene query string syntax
    
</dd>
</dl>

<dl>
<dd>

**searchEngine:** `*string` — Search engine version (v1, v2, or v3)
    
</dd>
</dl>

<dl>
<dd>

**fields:** `*string` — Comma-separated list of fields to include or exclude
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.GetUserById(UserId) -> *fern.User</code></summary>
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

```go
client.Service.GetUserById(
        context.TODO(),
        "userId",
        &fern.GetUserRequest{
            Fields: fern.String(
                "fields",
            ),
            IncludeFields: fern.Bool(
                true,
            ),
        },
    )
}
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

**fields:** `*string` — Comma-separated list of fields to include or exclude
    
</dd>
</dl>

<dl>
<dd>

**includeFields:** `*bool` — true to include the fields specified, false to exclude them
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.CreateUser(request) -> *fern.User</code></summary>
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

```go
client.Service.CreateUser(
        context.TODO(),
        &fern.CreateUserRequest{
            Email: "email",
            EmailVerified: fern.Bool(
                true,
            ),
            Username: fern.String(
                "username",
            ),
            Password: fern.String(
                "password",
            ),
            PhoneNumber: fern.String(
                "phone_number",
            ),
            PhoneVerified: fern.Bool(
                true,
            ),
            UserMetadata: map[string]any{
                "user_metadata": map[string]any{
                    "key": "value",
                },
            },
            AppMetadata: map[string]any{
                "app_metadata": map[string]any{
                    "key": "value",
                },
            },
            Connection: "connection",
        },
    )
}
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

**request:** `*fern.CreateUserRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.UpdateUser(UserId, request) -> *fern.User</code></summary>
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

```go
client.Service.UpdateUser(
        context.TODO(),
        "userId",
        &fern.UpdateUserRequest{
            Email: fern.String(
                "email",
            ),
            EmailVerified: fern.Bool(
                true,
            ),
            Username: fern.String(
                "username",
            ),
            PhoneNumber: fern.String(
                "phone_number",
            ),
            PhoneVerified: fern.Bool(
                true,
            ),
            UserMetadata: map[string]any{
                "user_metadata": map[string]any{
                    "key": "value",
                },
            },
            AppMetadata: map[string]any{
                "app_metadata": map[string]any{
                    "key": "value",
                },
            },
            Password: fern.String(
                "password",
            ),
            Blocked: fern.Bool(
                true,
            ),
        },
    )
}
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

**request:** `*fern.UpdateUserRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.DeleteUser(UserId) -> error</code></summary>
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

```go
client.Service.DeleteUser(
        context.TODO(),
        "userId",
    )
}
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

<details><summary><code>client.Service.ListConnections() -> []*fern.Connection</code></summary>
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

```go
client.Service.ListConnections(
        context.TODO(),
        &fern.ListConnectionsRequest{
            Strategy: fern.String(
                "strategy",
            ),
            Name: fern.String(
                "name",
            ),
            Fields: fern.String(
                "fields",
            ),
        },
    )
}
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

**strategy:** `*string` — Filter by strategy type (e.g., auth0, google-oauth2, samlp)
    
</dd>
</dl>

<dl>
<dd>

**name:** `*string` — Filter by connection name
    
</dd>
</dl>

<dl>
<dd>

**fields:** `*string` — Comma-separated list of fields to include
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.GetConnection(ConnectionId) -> *fern.Connection</code></summary>
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

```go
client.Service.GetConnection(
        context.TODO(),
        "connectionId",
        &fern.GetConnectionRequest{
            Fields: fern.String(
                "fields",
            ),
        },
    )
}
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

**fields:** `*string` — Comma-separated list of fields to include
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.ListClients() -> *fern.PaginatedClientResponse</code></summary>
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

```go
client.Service.ListClients(
        context.TODO(),
        &fern.ListClientsRequest{
            Fields: fern.String(
                "fields",
            ),
            IncludeFields: fern.Bool(
                true,
            ),
            Page: fern.Int(
                1,
            ),
            PerPage: fern.Int(
                1,
            ),
            IncludeTotals: fern.Bool(
                true,
            ),
            IsGlobal: fern.Bool(
                true,
            ),
            IsFirstParty: fern.Bool(
                true,
            ),
            AppType: []string{
                "app_type",
                "app_type",
            },
        },
    )
}
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

**fields:** `*string` — Comma-separated list of fields to include
    
</dd>
</dl>

<dl>
<dd>

**includeFields:** `*bool` — Whether specified fields are included or excluded
    
</dd>
</dl>

<dl>
<dd>

**page:** `*int` — Page number (zero-based)
    
</dd>
</dl>

<dl>
<dd>

**perPage:** `*int` — Number of results per page
    
</dd>
</dl>

<dl>
<dd>

**includeTotals:** `*bool` — Include total count in response
    
</dd>
</dl>

<dl>
<dd>

**isGlobal:** `*bool` — Filter by global clients
    
</dd>
</dl>

<dl>
<dd>

**isFirstParty:** `*bool` — Filter by first party clients
    
</dd>
</dl>

<dl>
<dd>

**appType:** `[]string` — Filter by application type (spa, native, regular_web, non_interactive)
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.GetClient(ClientId) -> *fern.Client</code></summary>
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

```go
client.Service.GetClient(
        context.TODO(),
        "clientId",
        &fern.GetClientRequest{
            Fields: fern.String(
                "fields",
            ),
            IncludeFields: fern.Bool(
                true,
            ),
        },
    )
}
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

**fields:** `*string` — Comma-separated list of fields to include
    
</dd>
</dl>

<dl>
<dd>

**includeFields:** `*bool` — Whether specified fields are included or excluded
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
