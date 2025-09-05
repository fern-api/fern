# Reference
## Service
<details><summary><code>client.Service.ListResources() -> Internal::Types::Array[Seed::Types::Types::Resource]</code></summary>
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

```ruby
client.service.list_resources({
  page:1,
  perPage:1,
  sort:'created_at',
  order:'desc',
  includeTotals:true,
  fields:'fields',
  search:'search'
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

**includeTotals:** `Internal::Types::Boolean` — Whether to include total count
    
</dd>
</dl>

<dl>
<dd>

**fields:** `String` — Comma-separated list of fields to include
    
</dd>
</dl>

<dl>
<dd>

**search:** `String` — Search query
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.GetResource(ResourceId) -> Seed::Types::Types::Resource</code></summary>
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

```ruby
client.service.get_resource({
  resourceId:'resourceId',
  includeMetadata:true,
  format:'json'
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

**resourceId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**includeMetadata:** `Internal::Types::Boolean` — Include metadata in response
    
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

<details><summary><code>client.Service.SearchResources(request) -> Seed::Types::Types::SearchResponse</code></summary>
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

```ruby
client.service.search_resources({
  limit:1,
  offset:1,
  query:'query',
  filters:{}
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

**query:** `String` — Search query text
    
</dd>
</dl>

<dl>
<dd>

**filters:** `Internal::Types::Hash[String, Internal::Types::Hash[String, Object]]` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.ListUsers() -> Seed::Types::Types::PaginatedUserResponse</code></summary>
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

```ruby
client.service.list_users({
  page:1,
  perPage:1,
  includeTotals:true,
  sort:'sort',
  connection:'connection',
  q:'q',
  searchEngine:'search_engine',
  fields:'fields'
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

**page:** `Integer` — Page index of the results to return. First page is 0.
    
</dd>
</dl>

<dl>
<dd>

**perPage:** `Integer` — Number of results per page.
    
</dd>
</dl>

<dl>
<dd>

**includeTotals:** `Internal::Types::Boolean` — Return results inside an object that contains the total result count (true) or as a direct array of results (false, default).
    
</dd>
</dl>

<dl>
<dd>

**sort:** `String` — Field to sort by. Use field:order where order is 1 for ascending and -1 for descending.
    
</dd>
</dl>

<dl>
<dd>

**connection:** `String` — Connection filter
    
</dd>
</dl>

<dl>
<dd>

**q:** `String` — Query string following Lucene query string syntax
    
</dd>
</dl>

<dl>
<dd>

**searchEngine:** `String` — Search engine version (v1, v2, or v3)
    
</dd>
</dl>

<dl>
<dd>

**fields:** `String` — Comma-separated list of fields to include or exclude
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.GetUserById(UserId) -> Seed::Types::Types::User</code></summary>
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

```ruby
client.service.get_user_by_id({
  userId:'userId',
  fields:'fields',
  includeFields:true
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

**userId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**fields:** `String` — Comma-separated list of fields to include or exclude
    
</dd>
</dl>

<dl>
<dd>

**includeFields:** `Internal::Types::Boolean` — true to include the fields specified, false to exclude them
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.CreateUser(request) -> Seed::Types::Types::User</code></summary>
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

```ruby
client.service.create_user({
  email:'email',
  email_verified:true,
  username:'username',
  password:'password',
  phone_number:'phone_number',
  phone_verified:true,
  user_metadata:{},
  app_metadata:{},
  connection:'connection'
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

**request:** `Seed::Types::Types::CreateUserRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.UpdateUser(UserId, request) -> Seed::Types::Types::User</code></summary>
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

```ruby
client.service.update_user({
  email:'email',
  email_verified:true,
  username:'username',
  phone_number:'phone_number',
  phone_verified:true,
  user_metadata:{},
  app_metadata:{},
  password:'password',
  blocked:true
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

**userId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Seed::Types::Types::UpdateUserRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.DeleteUser(UserId) -> </code></summary>
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

```ruby
client.service.delete_user();
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

<details><summary><code>client.Service.ListConnections() -> Internal::Types::Array[Seed::Types::Types::Connection]</code></summary>
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

```ruby
client.service.list_connections({
  strategy:'strategy',
  name:'name',
  fields:'fields'
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

**strategy:** `String` — Filter by strategy type (e.g., auth0, google-oauth2, samlp)
    
</dd>
</dl>

<dl>
<dd>

**name:** `String` — Filter by connection name
    
</dd>
</dl>

<dl>
<dd>

**fields:** `String` — Comma-separated list of fields to include
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.GetConnection(ConnectionId) -> Seed::Types::Types::Connection</code></summary>
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

```ruby
client.service.get_connection({
  connectionId:'connectionId',
  fields:'fields'
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

**connectionId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**fields:** `String` — Comma-separated list of fields to include
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.ListClients() -> Seed::Types::Types::PaginatedClientResponse</code></summary>
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

```ruby
client.service.list_clients({
  fields:'fields',
  includeFields:true,
  page:1,
  perPage:1,
  includeTotals:true,
  isGlobal:true,
  isFirstParty:true,
  appType:['app_type', 'app_type']
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

**fields:** `String` — Comma-separated list of fields to include
    
</dd>
</dl>

<dl>
<dd>

**includeFields:** `Internal::Types::Boolean` — Whether specified fields are included or excluded
    
</dd>
</dl>

<dl>
<dd>

**page:** `Integer` — Page number (zero-based)
    
</dd>
</dl>

<dl>
<dd>

**perPage:** `Integer` — Number of results per page
    
</dd>
</dl>

<dl>
<dd>

**includeTotals:** `Internal::Types::Boolean` — Include total count in response
    
</dd>
</dl>

<dl>
<dd>

**isGlobal:** `Internal::Types::Boolean` — Filter by global clients
    
</dd>
</dl>

<dl>
<dd>

**isFirstParty:** `Internal::Types::Boolean` — Filter by first party clients
    
</dd>
</dl>

<dl>
<dd>

**appType:** `Internal::Types::Array[String]` — Filter by application type (spa, native, regular_web, non_interactive)
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.GetClient(ClientId) -> Seed::Types::Types::Client</code></summary>
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

```ruby
client.service.get_client({
  clientId:'clientId',
  fields:'fields',
  includeFields:true
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

**clientId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**fields:** `String` — Comma-separated list of fields to include
    
</dd>
</dl>

<dl>
<dd>

**includeFields:** `Internal::Types::Boolean` — Whether specified fields are included or excluded
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
