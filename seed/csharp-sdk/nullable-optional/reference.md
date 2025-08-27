# Reference
## NullableOptional
<details><summary><code>client.NullableOptional.<a href="/src/SeedNullableOptional/NullableOptional/NullableOptionalClient.cs">GetUserAsync</a>(userId) -> UserResponse</code></summary>
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
await client.NullableOptional.GetUserAsync("userId");
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

<details><summary><code>client.NullableOptional.<a href="/src/SeedNullableOptional/NullableOptional/NullableOptionalClient.cs">CreateUserAsync</a>(CreateUserRequest { ... }) -> UserResponse</code></summary>
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
await client.NullableOptional.CreateUserAsync(
    new CreateUserRequest
    {
        Username = "username",
        Email = "email",
        Phone = "phone",
        Address = new Address
        {
            Street = "street",
            City = "city",
            State = "state",
            ZipCode = "zipCode",
            Country = "country",
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

**request:** `CreateUserRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.NullableOptional.<a href="/src/SeedNullableOptional/NullableOptional/NullableOptionalClient.cs">UpdateUserAsync</a>(userId, UpdateUserRequest { ... }) -> UserResponse</code></summary>
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

```csharp
await client.NullableOptional.UpdateUserAsync(
    "userId",
    new UpdateUserRequest
    {
        Username = "username",
        Email = "email",
        Phone = "phone",
        Address = new Address
        {
            Street = "street",
            City = "city",
            State = "state",
            ZipCode = "zipCode",
            Country = "country",
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

<details><summary><code>client.NullableOptional.<a href="/src/SeedNullableOptional/NullableOptional/NullableOptionalClient.cs">ListUsersAsync</a>(ListUsersRequest { ... }) -> IEnumerable<UserResponse></code></summary>
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

```csharp
await client.NullableOptional.ListUsersAsync(
    new ListUsersRequest
    {
        Limit = 1,
        Offset = 1,
        IncludeDeleted = true,
        SortBy = "sortBy",
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

<details><summary><code>client.NullableOptional.<a href="/src/SeedNullableOptional/NullableOptional/NullableOptionalClient.cs">SearchUsersAsync</a>(SearchUsersRequest { ... }) -> IEnumerable<UserResponse></code></summary>
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

```csharp
await client.NullableOptional.SearchUsersAsync(
    new SearchUsersRequest
    {
        Query = "query",
        Department = "department",
        Role = "role",
        IsActive = true,
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

**request:** `SearchUsersRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
