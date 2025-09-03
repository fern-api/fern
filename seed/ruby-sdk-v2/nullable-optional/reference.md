# Reference
## NullableOptional
<details><summary><code>client.NullableOptional.GetUser(UserId) -> Seed::NullableOptional::Types::UserResponse</code></summary>
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

<details><summary><code>client.NullableOptional.CreateUser(request) -> Seed::NullableOptional::Types::UserResponse</code></summary>
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
    country:'country'
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

<details><summary><code>client.NullableOptional.UpdateUser(UserId, request) -> Seed::NullableOptional::Types::UserResponse</code></summary>
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
    country:'country'
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

<details><summary><code>client.NullableOptional.ListUsers() -> Internal::Types::Array[Seed::NullableOptional::Types::UserResponse]</code></summary>
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

<details><summary><code>client.NullableOptional.SearchUsers() -> Internal::Types::Array[Seed::NullableOptional::Types::UserResponse]</code></summary>
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
