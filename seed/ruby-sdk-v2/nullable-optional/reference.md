# Reference
## NullableOptional
<details><summary><code>client.nullable_optional.get_user(user_id) -> Seed::NullableOptional::Types::UserResponse</code></summary>
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
client.nullable_optional.get_user('userId');
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullable_optional.create_user(request) -> Seed::NullableOptional::Types::UserResponse</code></summary>
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
client.nullable_optional.create_user({
  username: 'username',
  email: 'email',
  phone: 'phone',
  address: {
    street: 'street',
    city: 'city',
    state: 'state',
    zip_code: 'zipCode',
    country: 'country',
    building_id: 'buildingId',
    tenant_id: 'tenantId'
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

**request:** `Seed::NullableOptional::Types::CreateUserRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullable_optional.update_user(user_id, request) -> Seed::NullableOptional::Types::UserResponse</code></summary>
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
client.nullable_optional.update_user(
  'userId',
  {
    username: 'username',
    email: 'email',
    phone: 'phone',
    address: {
      street: 'street',
      city: 'city',
      state: 'state',
      zip_code: 'zipCode',
      country: 'country',
      building_id: 'buildingId',
      tenant_id: 'tenantId'
    }
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

**user_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Seed::NullableOptional::Types::UpdateUserRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullable_optional.list_users() -> Internal::Types::Array[Seed::NullableOptional::Types::UserResponse]</code></summary>
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
client.nullable_optional.list_users(
  limit: 1,
  offset: 1,
  include_deleted: true,
  sort_by: 'sortBy'
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullable_optional.search_users() -> Internal::Types::Array[Seed::NullableOptional::Types::UserResponse]</code></summary>
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
client.nullable_optional.search_users(
  query: 'query',
  department: 'department',
  role: 'role',
  is_active: true
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullable_optional.create_complex_profile(request) -> Seed::NullableOptional::Types::ComplexProfile</code></summary>
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
client.nullable_optional.create_complex_profile({
  id: 'id',
  nullable_array: ['nullableArray', 'nullableArray'],
  optional_array: ['optionalArray', 'optionalArray'],
  optional_nullable_array: ['optionalNullableArray', 'optionalNullableArray'],
  nullable_list_of_nullables: ['nullableListOfNullables', 'nullableListOfNullables'],
  nullable_map_of_nullables: {
    nullableMapOfNullables: {
      street: 'street',
      city: 'city',
      state: 'state',
      zip_code: 'zipCode',
      country: 'country',
      building_id: 'buildingId',
      tenant_id: 'tenantId'
    }
  },
  nullable_list_of_unions: [],
  optional_map_of_enums: {}
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

**request:** `Seed::NullableOptional::Types::ComplexProfile` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullable_optional.get_complex_profile(profile_id) -> Seed::NullableOptional::Types::ComplexProfile</code></summary>
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
client.nullable_optional.get_complex_profile('profileId');
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullable_optional.update_complex_profile(profile_id, request) -> Seed::NullableOptional::Types::ComplexProfile</code></summary>
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
client.nullable_optional.update_complex_profile(
  profile_id: 'profileId',
  nullable_array: ['nullableArray', 'nullableArray']
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

**profile_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**nullable_role:** `Seed::NullableOptional::Types::UserRole` 
    
</dd>
</dl>

<dl>
<dd>

**nullable_status:** `Seed::NullableOptional::Types::UserStatus` 
    
</dd>
</dl>

<dl>
<dd>

**nullable_notification:** `Seed::NullableOptional::Types::NotificationMethod` 
    
</dd>
</dl>

<dl>
<dd>

**nullable_search_result:** `Seed::NullableOptional::Types::SearchResult` 
    
</dd>
</dl>

<dl>
<dd>

**nullable_array:** `Internal::Types::Array[String]` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullable_optional.test_deserialization(request) -> Seed::NullableOptional::Types::DeserializationTestResponse</code></summary>
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
client.nullable_optional.test_deserialization({
  required_string: 'requiredString',
  nullable_string: 'nullableString',
  optional_string: 'optionalString',
  optional_nullable_string: 'optionalNullableString',
  nullable_list: ['nullableList', 'nullableList'],
  nullable_map: {
    nullableMap: 1
  },
  nullable_object: {
    street: 'street',
    city: 'city',
    state: 'state',
    zip_code: 'zipCode',
    country: 'country',
    building_id: 'buildingId',
    tenant_id: 'tenantId'
  },
  optional_object: {
    id: 'id',
    name: 'name',
    domain: 'domain',
    employee_count: 1
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

**request:** `Seed::NullableOptional::Types::DeserializationTestRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullable_optional.filter_by_role() -> Internal::Types::Array[Seed::NullableOptional::Types::UserResponse]</code></summary>
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
client.nullable_optional.filter_by_role();
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

**role:** `Seed::NullableOptional::Types::UserRole` 
    
</dd>
</dl>

<dl>
<dd>

**status:** `Seed::NullableOptional::Types::UserStatus` 
    
</dd>
</dl>

<dl>
<dd>

**secondary_role:** `Seed::NullableOptional::Types::UserRole` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullable_optional.get_notification_settings(user_id) -> Seed::NullableOptional::Types::NotificationMethod</code></summary>
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
client.nullable_optional.get_notification_settings('userId');
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullable_optional.update_tags(user_id, request) -> Internal::Types::Array[String]</code></summary>
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
client.nullable_optional.update_tags(
  user_id: 'userId',
  tags: ['tags', 'tags'],
  categories: ['categories', 'categories'],
  labels: ['labels', 'labels']
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullable_optional.get_search_results(request) -> Internal::Types::Array[Seed::NullableOptional::Types::SearchResult]</code></summary>
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
client.nullable_optional.get_search_results(
  query: 'query',
  filters: {
    filters: 'filters'
  },
  include_types: ['includeTypes', 'includeTypes']
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
</dd>
</dl>


</dd>
</dl>
</details>
