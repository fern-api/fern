# Reference
## NullableOptional
<details><summary><code>client.NullableOptional.GetUser(UserId) -> *fern.UserResponse</code></summary>
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
client.NullableOptional.GetUser(
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

<details><summary><code>client.NullableOptional.CreateUser(request) -> *fern.UserResponse</code></summary>
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
client.NullableOptional.CreateUser(
        context.TODO(),
        &fern.CreateUserRequest{
            Username: "username",
            Email: fern.String(
                "email",
            ),
            Phone: fern.String(
                "phone",
            ),
            Address: &fern.Address{
                Street: "street",
                City: fern.String(
                    "city",
                ),
                State: fern.String(
                    "state",
                ),
                ZipCode: "zipCode",
                Country: fern.String(
                    "country",
                ),
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

**request:** `*fern.CreateUserRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.NullableOptional.UpdateUser(UserId, request) -> *fern.UserResponse</code></summary>
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

```go
client.NullableOptional.UpdateUser(
        context.TODO(),
        "userId",
        &fern.UpdateUserRequest{
            Username: fern.String(
                "username",
            ),
            Email: fern.String(
                "email",
            ),
            Phone: fern.String(
                "phone",
            ),
            Address: &fern.Address{
                Street: "street",
                City: fern.String(
                    "city",
                ),
                State: fern.String(
                    "state",
                ),
                ZipCode: "zipCode",
                Country: fern.String(
                    "country",
                ),
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

<details><summary><code>client.NullableOptional.ListUsers() -> []*fern.UserResponse</code></summary>
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

```go
client.NullableOptional.ListUsers(
        context.TODO(),
        &fern.ListUsersRequest{
            Limit: fern.Int(
                1,
            ),
            Offset: fern.Int(
                1,
            ),
            IncludeDeleted: fern.Bool(
                true,
            ),
            SortBy: fern.String(
                "sortBy",
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

**limit:** `*int` 
    
</dd>
</dl>

<dl>
<dd>

**offset:** `*int` 
    
</dd>
</dl>

<dl>
<dd>

**includeDeleted:** `*bool` 
    
</dd>
</dl>

<dl>
<dd>

**sortBy:** `*string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.NullableOptional.SearchUsers() -> []*fern.UserResponse</code></summary>
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

```go
client.NullableOptional.SearchUsers(
        context.TODO(),
        &fern.SearchUsersRequest{
            Query: "query",
            Department: fern.String(
                "department",
            ),
            Role: fern.String(
                "role",
            ),
            IsActive: fern.Bool(
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

**query:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**department:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**role:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**isActive:** `*bool` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
