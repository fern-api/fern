# Reference
## Service
<details><summary><code>client.service.<a href="/lib/seed/service/client.rb">listresources</a>() -> Internal::Types::Array[Seed::Types::Resource]</code></summary>
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
client.service.listresources(
  page: 1,
  per_page: 1,
  sort: "sort",
  order: "order",
  include_totals: true
)
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

**per_page:** `Integer` — Number of items per page
    
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

**include_totals:** `Internal::Types::Boolean` — Whether to include total count
    
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

<dl>
<dd>

**request_options:** `Seed::Service::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/lib/seed/service/client.rb">getresource</a>(resource_id) -> Seed::Types::Resource</code></summary>
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
client.service.getresource(
  resource_id: "resourceId",
  include_metadata: true,
  format: "format"
)
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

**resource_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**include_metadata:** `Internal::Types::Boolean` — Include metadata in response
    
</dd>
</dl>

<dl>
<dd>

**format:** `String` — Response format
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Service::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/lib/seed/service/client.rb">searchresources</a>(request) -> Seed::Types::SearchResponse</code></summary>
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
client.service.searchresources(
  limit: 1,
  offset: 1
)
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

**filters:** `Internal::Types::Hash[String, Object]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Service::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/lib/seed/service/client.rb">listusers</a>() -> Seed::Types::PaginatedUserResponse</code></summary>
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
client.service.listusers
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

**per_page:** `Integer` — Number of results per page.
    
</dd>
</dl>

<dl>
<dd>

**include_totals:** `Internal::Types::Boolean` — Return results inside an object that contains the total result count (true) or as a direct array of results (false, default).
    
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

**search_engine:** `String` — Search engine version (v1, v2, or v3)
    
</dd>
</dl>

<dl>
<dd>

**fields:** `String` — Comma-separated list of fields to include or exclude
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Service::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/lib/seed/service/client.rb">createuser</a>(request) -> Seed::Types::User</code></summary>
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
client.service.createuser(
  email: "email",
  connection: "connection"
)
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

**email_verified:** `Internal::Types::Boolean` 
    
</dd>
</dl>

<dl>
<dd>

**username:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**password:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**phone_number:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**phone_verified:** `Internal::Types::Boolean` 
    
</dd>
</dl>

<dl>
<dd>

**user_metadata:** `Internal::Types::Hash[String, Object]` 
    
</dd>
</dl>

<dl>
<dd>

**app_metadata:** `Internal::Types::Hash[String, Object]` 
    
</dd>
</dl>

<dl>
<dd>

**connection:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Service::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/lib/seed/service/client.rb">getuserbyid</a>(user_id) -> Seed::Types::User</code></summary>
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
client.service.getuserbyid(user_id: "userId")
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

**user_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**fields:** `String` — Comma-separated list of fields to include or exclude
    
</dd>
</dl>

<dl>
<dd>

**include_fields:** `Internal::Types::Boolean` — true to include the fields specified, false to exclude them
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Service::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/lib/seed/service/client.rb">deleteuser</a>(user_id) -> </code></summary>
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
client.service.deleteuser(user_id: "userId")
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

**user_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Service::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/lib/seed/service/client.rb">updateuser</a>(user_id, request) -> Seed::Types::User</code></summary>
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
client.service.updateuser(user_id: "userId")
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

**user_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**email:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**email_verified:** `Internal::Types::Boolean` 
    
</dd>
</dl>

<dl>
<dd>

**username:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**phone_number:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**phone_verified:** `Internal::Types::Boolean` 
    
</dd>
</dl>

<dl>
<dd>

**user_metadata:** `Internal::Types::Hash[String, Object]` 
    
</dd>
</dl>

<dl>
<dd>

**app_metadata:** `Internal::Types::Hash[String, Object]` 
    
</dd>
</dl>

<dl>
<dd>

**password:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**blocked:** `Internal::Types::Boolean` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Service::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/lib/seed/service/client.rb">listconnections</a>() -> Internal::Types::Array[Seed::Types::Connection]</code></summary>
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
client.service.listconnections
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

<dl>
<dd>

**request_options:** `Seed::Service::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/lib/seed/service/client.rb">getconnection</a>(connection_id) -> Seed::Types::Connection</code></summary>
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
client.service.getconnection(connection_id: "connectionId")
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

**connection_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**fields:** `String` — Comma-separated list of fields to include
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Service::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/lib/seed/service/client.rb">listclients</a>() -> Seed::Types::PaginatedClientResponse</code></summary>
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
client.service.listclients
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

**include_fields:** `Internal::Types::Boolean` — Whether specified fields are included or excluded
    
</dd>
</dl>

<dl>
<dd>

**page:** `Integer` — Page number (zero-based)
    
</dd>
</dl>

<dl>
<dd>

**per_page:** `Integer` — Number of results per page
    
</dd>
</dl>

<dl>
<dd>

**include_totals:** `Internal::Types::Boolean` — Include total count in response
    
</dd>
</dl>

<dl>
<dd>

**is_global:** `Internal::Types::Boolean` — Filter by global clients
    
</dd>
</dl>

<dl>
<dd>

**is_first_party:** `Internal::Types::Boolean` — Filter by first party clients
    
</dd>
</dl>

<dl>
<dd>

**app_type:** `Internal::Types::Array[String]` — Filter by application type (spa, native, regular_web, non_interactive)
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Service::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/lib/seed/service/client.rb">getclient</a>(client_id) -> Seed::Types::Client</code></summary>
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
client.service.getclient(client_id: "clientId")
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

**client_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**fields:** `String` — Comma-separated list of fields to include
    
</dd>
</dl>

<dl>
<dd>

**include_fields:** `Internal::Types::Boolean` — Whether specified fields are included or excluded
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Service::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

