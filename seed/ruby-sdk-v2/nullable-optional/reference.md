# Reference
## Nullableoptional
<details><summary><code>client.nullableoptional.<a href="/lib/seed/nullableoptional/client.rb">getuser</a>(user_id) -> Seed::Types::UserResponse</code></summary>
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
client.nullableoptional.getuser(user_id: "userId")
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

**request_options:** `Seed::Nullableoptional::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableoptional.<a href="/lib/seed/nullableoptional/client.rb">updateuser</a>(user_id, request) -> Seed::Types::UserResponse</code></summary>
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

```ruby
client.nullableoptional.updateuser(user_id: "userId")
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

**username:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**email:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**phone:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**address:** `Seed::Types::Address` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Nullableoptional::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableoptional.<a href="/lib/seed/nullableoptional/client.rb">listusers</a>() -> Internal::Types::Array[Seed::Types::UserResponse]</code></summary>
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

```ruby
client.nullableoptional.listusers
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

**limit:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**offset:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**include_deleted:** `Internal::Types::Boolean` 
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Nullableoptional::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableoptional.<a href="/lib/seed/nullableoptional/client.rb">createuser</a>(request) -> Seed::Types::UserResponse</code></summary>
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
client.nullableoptional.createuser(username: "username")
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

**username:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**email:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**phone:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**address:** `Seed::Types::Address` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Nullableoptional::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableoptional.<a href="/lib/seed/nullableoptional/client.rb">searchusers</a>() -> Internal::Types::Array[Seed::Types::UserResponse]</code></summary>
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

```ruby
client.nullableoptional.searchusers(
  query: "query",
  department: "department"
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

**query:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**department:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**role:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**is_active:** `Internal::Types::Boolean` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Nullableoptional::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableoptional.<a href="/lib/seed/nullableoptional/client.rb">createcomplexprofile</a>(request) -> Seed::Types::ComplexProfile</code></summary>
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

```ruby
client.nullableoptional.createcomplexprofile(
  id: "id",
  nullable_role: "ADMIN",
  nullable_status: "active",
  nullable_notification: {
    email_address: "emailAddress",
    subject: "subject",
    type: "email"
  },
  nullable_search_result: {
    id: "id",
    username: "username",
    created_at: "2024-01-15T09:30:00Z",
    type: "user"
  }
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

**request:** `Seed::Types::ComplexProfile` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Nullableoptional::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableoptional.<a href="/lib/seed/nullableoptional/client.rb">getcomplexprofile</a>(profile_id) -> Seed::Types::ComplexProfile</code></summary>
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

```ruby
client.nullableoptional.getcomplexprofile(profile_id: "profileId")
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

**profile_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Nullableoptional::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableoptional.<a href="/lib/seed/nullableoptional/client.rb">updatecomplexprofile</a>(profile_id, request) -> Seed::Types::ComplexProfile</code></summary>
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

```ruby
client.nullableoptional.updatecomplexprofile(profile_id: "profileId")
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

**profile_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**nullable_role:** `Seed::Types::UserRole` 
    
</dd>
</dl>

<dl>
<dd>

**nullable_status:** `Seed::Types::UserStatus` 
    
</dd>
</dl>

<dl>
<dd>

**nullable_notification:** `Seed::Types::NotificationMethod` 
    
</dd>
</dl>

<dl>
<dd>

**nullable_search_result:** `Seed::Types::SearchResult` 
    
</dd>
</dl>

<dl>
<dd>

**nullable_array:** `Internal::Types::Array[String]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Nullableoptional::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableoptional.<a href="/lib/seed/nullableoptional/client.rb">testdeserialization</a>(request) -> Seed::Types::DeserializationTestResponse</code></summary>
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

```ruby
client.nullableoptional.testdeserialization(
  required_string: "requiredString",
  nullable_enum: "ADMIN",
  nullable_union: {
    email_address: "emailAddress",
    subject: "subject",
    type: "email"
  },
  nullable_object: {
    street: "street",
    zip_code: "zipCode"
  }
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

**request:** `Seed::Types::DeserializationTestRequest` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Nullableoptional::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableoptional.<a href="/lib/seed/nullableoptional/client.rb">filterbyrole</a>() -> Internal::Types::Array[Seed::Types::UserResponse]</code></summary>
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

```ruby
client.nullableoptional.filterbyrole(role: "ADMIN")
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

**role:** `Seed::Types::UserRole` 
    
</dd>
</dl>

<dl>
<dd>

**status:** `Seed::Types::UserStatus` 
    
</dd>
</dl>

<dl>
<dd>

**secondary_role:** `Seed::Types::UserRole` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Nullableoptional::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableoptional.<a href="/lib/seed/nullableoptional/client.rb">getnotificationsettings</a>(user_id) -> Seed::Types::NotificationMethod</code></summary>
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

```ruby
client.nullableoptional.getnotificationsettings(user_id: "userId")
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

**request_options:** `Seed::Nullableoptional::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableoptional.<a href="/lib/seed/nullableoptional/client.rb">updatetags</a>(user_id, request) -> Internal::Types::Array[String]</code></summary>
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

```ruby
client.nullableoptional.updatetags(user_id: "userId")
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

**tags:** `Internal::Types::Array[String]` 
    
</dd>
</dl>

<dl>
<dd>

**categories:** `Internal::Types::Array[String]` 
    
</dd>
</dl>

<dl>
<dd>

**labels:** `Internal::Types::Array[String]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Nullableoptional::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableoptional.<a href="/lib/seed/nullableoptional/client.rb">getsearchresults</a>(request) -> Internal::Types::Array[Seed::Types::SearchResult]</code></summary>
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

```ruby
client.nullableoptional.getsearchresults(query: "query")
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

**query:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**filters:** `Internal::Types::Hash[String, String]` 
    
</dd>
</dl>

<dl>
<dd>

**include_types:** `Internal::Types::Array[String]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Nullableoptional::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

