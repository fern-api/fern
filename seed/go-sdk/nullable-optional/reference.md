# Reference
## Nullableoptional
<details><summary><code>client.Nullableoptional.Getuser(UserID) -> *fern.UserResponse</code></summary>
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
request := &fern.NullableOptionalGetUserRequest{
        UserID: "userId",
    }
client.Nullableoptional.Getuser(
        context.TODO(),
        request,
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

**userID:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Nullableoptional.Updateuser(UserID, request) -> *fern.UserResponse</code></summary>
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
request := &fern.UpdateUserRequest{
        UserID: "userId",
    }
client.Nullableoptional.Updateuser(
        context.TODO(),
        request,
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

**userID:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**username:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**email:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**phone:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**address:** `*fern.Address` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Nullableoptional.Listusers() -> []*fern.UserResponse</code></summary>
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
request := &fern.NullableOptionalListUsersRequest{}
client.Nullableoptional.Listusers(
        context.TODO(),
        request,
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

<details><summary><code>client.Nullableoptional.Createuser(request) -> *fern.UserResponse</code></summary>
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
request := &fern.CreateUserRequest{
        Username: "username",
    }
client.Nullableoptional.Createuser(
        context.TODO(),
        request,
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

**username:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**email:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**phone:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**address:** `*fern.Address` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Nullableoptional.Searchusers() -> []*fern.UserResponse</code></summary>
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
request := &fern.NullableOptionalSearchUsersRequest{
        Query: "query",
        Department: fern.String(
            "department",
        ),
    }
client.Nullableoptional.Searchusers(
        context.TODO(),
        request,
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

<details><summary><code>client.Nullableoptional.Createcomplexprofile(request) -> *fern.ComplexProfile</code></summary>
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

```go
request := &fern.ComplexProfile{
        ID: "id",
        NullableRole: fern.UserRoleAdmin,
        NullableStatus: fern.UserStatusActive,
        NullableNotification: &fern.NotificationMethod{
            NotificationMethodZero: &fern.NotificationMethodZero{
                EmailAddress: "emailAddress",
                Subject: "subject",
                Type: fern.NotificationMethodZeroTypeEmail,
            },
        },
        NullableSearchResult: &fern.SearchResult{
            SearchResultZero: &fern.SearchResultZero{
                ID: "id",
                Username: "username",
                CreatedAt: fern.MustParseDateTime(
                    "2024-01-15T09:30:00Z",
                ),
                Type: fern.SearchResultZeroTypeUser,
            },
        },
    }
client.Nullableoptional.Createcomplexprofile(
        context.TODO(),
        request,
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

**request:** `*fern.ComplexProfile` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Nullableoptional.Getcomplexprofile(ProfileID) -> *fern.ComplexProfile</code></summary>
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

```go
request := &fern.NullableOptionalGetComplexProfileRequest{
        ProfileID: "profileId",
    }
client.Nullableoptional.Getcomplexprofile(
        context.TODO(),
        request,
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

**profileID:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Nullableoptional.Updatecomplexprofile(ProfileID, request) -> *fern.ComplexProfile</code></summary>
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

```go
request := &fern.NullableOptionalUpdateComplexProfileRequest{
        ProfileID: "profileId",
    }
client.Nullableoptional.Updatecomplexprofile(
        context.TODO(),
        request,
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

**profileID:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**nullableRole:** `*fern.UserRole` 
    
</dd>
</dl>

<dl>
<dd>

**nullableStatus:** `*fern.UserStatus` 
    
</dd>
</dl>

<dl>
<dd>

**nullableNotification:** `*fern.NotificationMethod` 
    
</dd>
</dl>

<dl>
<dd>

**nullableSearchResult:** `*fern.SearchResult` 
    
</dd>
</dl>

<dl>
<dd>

**nullableArray:** `[]string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Nullableoptional.Testdeserialization(request) -> *fern.DeserializationTestResponse</code></summary>
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

```go
request := &fern.DeserializationTestRequest{
        RequiredString: "requiredString",
        NullableEnum: fern.UserRoleAdmin,
        NullableUnion: &fern.NotificationMethod{
            NotificationMethodZero: &fern.NotificationMethodZero{
                EmailAddress: "emailAddress",
                Subject: "subject",
                Type: fern.NotificationMethodZeroTypeEmail,
            },
        },
        NullableObject: &fern.Address{
            Street: "street",
            ZipCode: "zipCode",
        },
    }
client.Nullableoptional.Testdeserialization(
        context.TODO(),
        request,
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

**request:** `*fern.DeserializationTestRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Nullableoptional.Filterbyrole() -> []*fern.UserResponse</code></summary>
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

```go
request := &fern.NullableOptionalFilterByRoleRequest{
        Role: fern.UserRoleAdmin,
    }
client.Nullableoptional.Filterbyrole(
        context.TODO(),
        request,
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

**role:** `*fern.UserRole` 
    
</dd>
</dl>

<dl>
<dd>

**status:** `*fern.UserStatus` 
    
</dd>
</dl>

<dl>
<dd>

**secondaryRole:** `*fern.UserRole` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Nullableoptional.Getnotificationsettings(UserID) -> *fern.NotificationMethod</code></summary>
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

```go
request := &fern.NullableOptionalGetNotificationSettingsRequest{
        UserID: "userId",
    }
client.Nullableoptional.Getnotificationsettings(
        context.TODO(),
        request,
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

**userID:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Nullableoptional.Updatetags(UserID, request) -> []string</code></summary>
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

```go
request := &fern.NullableOptionalUpdateTagsRequest{
        UserID: "userId",
    }
client.Nullableoptional.Updatetags(
        context.TODO(),
        request,
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

**userID:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**tags:** `[]string` 
    
</dd>
</dl>

<dl>
<dd>

**categories:** `[]string` 
    
</dd>
</dl>

<dl>
<dd>

**labels:** `[]string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Nullableoptional.Getsearchresults(request) -> []*fern.SearchResult</code></summary>
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

```go
request := &fern.NullableOptionalGetSearchResultsRequest{
        Query: "query",
    }
client.Nullableoptional.Getsearchresults(
        context.TODO(),
        request,
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

**filters:** `map[string]*string` 
    
</dd>
</dl>

<dl>
<dd>

**includeTypes:** `[]string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

