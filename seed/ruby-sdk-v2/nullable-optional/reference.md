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
client.nullable_optional.get_user();
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
  username:'username',
  email:'email',
  phone:'phone',
  address:{
    street:'street',
    city:'city',
    state:'state',
    zipCode:'zipCode',
    country:'country',
    buildingId:'buildingId',
    tenantId:'tenantId'
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
client.nullable_optional.update_user({
  username:'username',
  email:'email',
  phone:'phone',
  address:{
    street:'street',
    city:'city',
    state:'state',
    zipCode:'zipCode',
    country:'country',
    buildingId:'buildingId',
    tenantId:'tenantId'
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

**userId:** `String` 
    
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
client.nullable_optional.list_users({
  limit:1,
  offset:1,
  includeDeleted:true,
  sortBy:'sortBy'
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

**includeDeleted:** `Internal::Types::Boolean` 
    
</dd>
</dl>

<dl>
<dd>

**sortBy:** `String` 
    
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
client.nullable_optional.search_users({
  query:'query',
  department:'department',
  role:'role',
  isActive:true
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

**isActive:** `Internal::Types::Boolean` 
    
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
  id:'id',
  nullableArray:['nullableArray', 'nullableArray'],
  optionalArray:['optionalArray', 'optionalArray'],
  optionalNullableArray:['optionalNullableArray', 'optionalNullableArray'],
  nullableListOfNullables:['nullableListOfNullables', 'nullableListOfNullables'],
  nullableMapOfNullables:{
    nullableMapOfNullables:{
      street:'street',
      city:'city',
      state:'state',
      zipCode:'zipCode',
      country:'country',
      buildingId:'buildingId',
      tenantId:'tenantId'
    }
  },
  nullableListOfUnions:[],
  optionalMapOfEnums:{}
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
client.nullable_optional.get_complex_profile();
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

**profileId:** `String` 
    
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
client.nullable_optional.update_complex_profile({
  profileId:'profileId',
  nullableArray:['nullableArray', 'nullableArray']
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

**profileId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**nullableRole:** `Seed::NullableOptional::Types::UserRole` 
    
</dd>
</dl>

<dl>
<dd>

**nullableStatus:** `Seed::NullableOptional::Types::UserStatus` 
    
</dd>
</dl>

<dl>
<dd>

**nullableNotification:** `Seed::NullableOptional::Types::NotificationMethod` 
    
</dd>
</dl>

<dl>
<dd>

**nullableSearchResult:** `Seed::NullableOptional::Types::SearchResult` 
    
</dd>
</dl>

<dl>
<dd>

**nullableArray:** `Internal::Types::Array[String]` 
    
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
  requiredString:'requiredString',
  nullableString:'nullableString',
  optionalString:'optionalString',
  optionalNullableString:'optionalNullableString',
  nullableList:['nullableList', 'nullableList'],
  nullableMap:{
    nullableMap:1
  },
  nullableObject:{
    street:'street',
    city:'city',
    state:'state',
    zipCode:'zipCode',
    country:'country',
    buildingId:'buildingId',
    tenantId:'tenantId'
  },
  optionalObject:{
    id:'id',
    name:'name',
    domain:'domain',
    employeeCount:1
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
client.nullable_optional.filter_by_role({});
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

**secondaryRole:** `Seed::NullableOptional::Types::UserRole` 
    
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
client.nullable_optional.get_notification_settings();
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
client.nullable_optional.update_tags({
  userId:'userId',
  tags:['tags', 'tags'],
  categories:['categories', 'categories'],
  labels:['labels', 'labels']
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
client.nullable_optional.get_search_results({
  query:'query',
  filters:{
    filters:'filters'
  },
  includeTypes:['includeTypes', 'includeTypes']
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

**includeTypes:** `Internal::Types::Array[String]` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
