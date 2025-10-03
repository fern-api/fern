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
request := &fern.CreateUserRequest{
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
            BuildingId: fern.String(
                "buildingId",
            ),
            TenantId: fern.String(
                "tenantId",
            ),
        },
    }
client.NullableOptional.CreateUser(
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
request := &fern.UpdateUserRequest{
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
            BuildingId: fern.String(
                "buildingId",
            ),
            TenantId: fern.String(
                "tenantId",
            ),
        },
    }
client.NullableOptional.UpdateUser(
        context.TODO(),
        "userId",
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
request := &fern.ListUsersRequest{
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
    }
client.NullableOptional.ListUsers(
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
request := &fern.SearchUsersRequest{
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
    }
client.NullableOptional.SearchUsers(
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

<details><summary><code>client.NullableOptional.CreateComplexProfile(request) -> *fern.ComplexProfile</code></summary>
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
        Id: "id",
        NullableRole: fern.UserRoleAdmin.Ptr(),
        OptionalRole: fern.UserRoleAdmin.Ptr(),
        OptionalNullableRole: fern.UserRoleAdmin.Ptr(),
        NullableStatus: fern.UserStatusActive.Ptr(),
        OptionalStatus: fern.UserStatusActive.Ptr(),
        OptionalNullableStatus: fern.UserStatusActive.Ptr(),
        NullableNotification: &fern.NotificationMethod{
            Email: &fern.EmailNotification{
                EmailAddress: "emailAddress",
                Subject: "subject",
                HtmlContent: fern.String(
                    "htmlContent",
                ),
            },
        },
        OptionalNotification: &fern.NotificationMethod{
            Email: &fern.EmailNotification{
                EmailAddress: "emailAddress",
                Subject: "subject",
                HtmlContent: fern.String(
                    "htmlContent",
                ),
            },
        },
        OptionalNullableNotification: &fern.NotificationMethod{
            Email: &fern.EmailNotification{
                EmailAddress: "emailAddress",
                Subject: "subject",
                HtmlContent: fern.String(
                    "htmlContent",
                ),
            },
        },
        NullableSearchResult: &fern.SearchResult{
            User: &fern.UserResponse{
                Id: "id",
                Username: "username",
                Email: fern.String(
                    "email",
                ),
                Phone: fern.String(
                    "phone",
                ),
                CreatedAt: fern.MustParseDateTime(
                    "2024-01-15T09:30:00Z",
                ),
                UpdatedAt: fern.Time(
                    fern.MustParseDateTime(
                        "2024-01-15T09:30:00Z",
                    ),
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
                    BuildingId: fern.String(
                        "buildingId",
                    ),
                    TenantId: fern.String(
                        "tenantId",
                    ),
                },
            },
        },
        OptionalSearchResult: &fern.SearchResult{
            User: &fern.UserResponse{
                Id: "id",
                Username: "username",
                Email: fern.String(
                    "email",
                ),
                Phone: fern.String(
                    "phone",
                ),
                CreatedAt: fern.MustParseDateTime(
                    "2024-01-15T09:30:00Z",
                ),
                UpdatedAt: fern.Time(
                    fern.MustParseDateTime(
                        "2024-01-15T09:30:00Z",
                    ),
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
                    BuildingId: fern.String(
                        "buildingId",
                    ),
                    TenantId: fern.String(
                        "tenantId",
                    ),
                },
            },
        },
        NullableArray: []string{
            "nullableArray",
            "nullableArray",
        },
        OptionalArray: []string{
            "optionalArray",
            "optionalArray",
        },
        OptionalNullableArray: []string{
            "optionalNullableArray",
            "optionalNullableArray",
        },
        NullableListOfNullables: []*string{
            fern.String(
                "nullableListOfNullables",
            ),
            fern.String(
                "nullableListOfNullables",
            ),
        },
        NullableMapOfNullables: map[string]*fern.Address{
            "nullableMapOfNullables": &fern.Address{
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
                BuildingId: fern.String(
                    "buildingId",
                ),
                TenantId: fern.String(
                    "tenantId",
                ),
            },
        },
        NullableListOfUnions: []*fern.NotificationMethod{
            &fern.NotificationMethod{
                Email: &fern.EmailNotification{
                    EmailAddress: "emailAddress",
                    Subject: "subject",
                    HtmlContent: fern.String(
                        "htmlContent",
                    ),
                },
            },
            &fern.NotificationMethod{
                Email: &fern.EmailNotification{
                    EmailAddress: "emailAddress",
                    Subject: "subject",
                    HtmlContent: fern.String(
                        "htmlContent",
                    ),
                },
            },
        },
        OptionalMapOfEnums: map[string]fern.UserRole{
            "optionalMapOfEnums": fern.UserRoleAdmin,
        },
    }
client.NullableOptional.CreateComplexProfile(
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

<details><summary><code>client.NullableOptional.GetComplexProfile(ProfileId) -> *fern.ComplexProfile</code></summary>
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
client.NullableOptional.GetComplexProfile(
        context.TODO(),
        "profileId",
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

**profileId:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.NullableOptional.UpdateComplexProfile(ProfileId, request) -> *fern.ComplexProfile</code></summary>
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
request := &fern.UpdateComplexProfileRequest{
        NullableRole: fern.UserRoleAdmin.Ptr(),
        NullableStatus: fern.UserStatusActive.Ptr(),
        NullableNotification: &fern.NotificationMethod{
            Email: &fern.EmailNotification{
                EmailAddress: "emailAddress",
                Subject: "subject",
                HtmlContent: fern.String(
                    "htmlContent",
                ),
            },
        },
        NullableSearchResult: &fern.SearchResult{
            User: &fern.UserResponse{
                Id: "id",
                Username: "username",
                Email: fern.String(
                    "email",
                ),
                Phone: fern.String(
                    "phone",
                ),
                CreatedAt: fern.MustParseDateTime(
                    "2024-01-15T09:30:00Z",
                ),
                UpdatedAt: fern.Time(
                    fern.MustParseDateTime(
                        "2024-01-15T09:30:00Z",
                    ),
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
                    BuildingId: fern.String(
                        "buildingId",
                    ),
                    TenantId: fern.String(
                        "tenantId",
                    ),
                },
            },
        },
        NullableArray: []string{
            "nullableArray",
            "nullableArray",
        },
    }
client.NullableOptional.UpdateComplexProfile(
        context.TODO(),
        "profileId",
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

**profileId:** `string` 
    
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

<details><summary><code>client.NullableOptional.TestDeserialization(request) -> *fern.DeserializationTestResponse</code></summary>
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
        NullableString: fern.String(
            "nullableString",
        ),
        OptionalString: fern.String(
            "optionalString",
        ),
        OptionalNullableString: fern.String(
            "optionalNullableString",
        ),
        NullableEnum: fern.UserRoleAdmin.Ptr(),
        OptionalEnum: fern.UserStatusActive.Ptr(),
        NullableUnion: &fern.NotificationMethod{
            Email: &fern.EmailNotification{
                EmailAddress: "emailAddress",
                Subject: "subject",
                HtmlContent: fern.String(
                    "htmlContent",
                ),
            },
        },
        OptionalUnion: &fern.SearchResult{
            User: &fern.UserResponse{
                Id: "id",
                Username: "username",
                Email: fern.String(
                    "email",
                ),
                Phone: fern.String(
                    "phone",
                ),
                CreatedAt: fern.MustParseDateTime(
                    "2024-01-15T09:30:00Z",
                ),
                UpdatedAt: fern.Time(
                    fern.MustParseDateTime(
                        "2024-01-15T09:30:00Z",
                    ),
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
                    BuildingId: fern.String(
                        "buildingId",
                    ),
                    TenantId: fern.String(
                        "tenantId",
                    ),
                },
            },
        },
        NullableList: []string{
            "nullableList",
            "nullableList",
        },
        NullableMap: map[string]int{
            "nullableMap": 1,
        },
        NullableObject: &fern.Address{
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
            BuildingId: fern.String(
                "buildingId",
            ),
            TenantId: fern.String(
                "tenantId",
            ),
        },
        OptionalObject: &fern.Organization{
            Id: "id",
            Name: "name",
            Domain: fern.String(
                "domain",
            ),
            EmployeeCount: fern.Int(
                1,
            ),
        },
    }
client.NullableOptional.TestDeserialization(
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

<details><summary><code>client.NullableOptional.FilterByRole() -> []*fern.UserResponse</code></summary>
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
request := &fern.FilterByRoleRequest{
        Role: fern.UserRoleAdmin.Ptr(),
        Status: fern.UserStatusActive.Ptr(),
        SecondaryRole: fern.UserRoleAdmin.Ptr(),
    }
client.NullableOptional.FilterByRole(
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

<details><summary><code>client.NullableOptional.GetNotificationSettings(UserId) -> *fern.NotificationMethod</code></summary>
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
client.NullableOptional.GetNotificationSettings(
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

<details><summary><code>client.NullableOptional.UpdateTags(UserId, request) -> []string</code></summary>
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
request := &fern.UpdateTagsRequest{
        Tags: []string{
            "tags",
            "tags",
        },
        Categories: []string{
            "categories",
            "categories",
        },
        Labels: []string{
            "labels",
            "labels",
        },
    }
client.NullableOptional.UpdateTags(
        context.TODO(),
        "userId",
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

**userId:** `string` 
    
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

<details><summary><code>client.NullableOptional.GetSearchResults(request) -> []*fern.SearchResult</code></summary>
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
request := &fern.SearchRequest{
        Query: "query",
        Filters: map[string]*string{
            "filters": fern.String(
                "filters",
            ),
        },
        IncludeTypes: []string{
            "includeTypes",
            "includeTypes",
        },
    }
client.NullableOptional.GetSearchResults(
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
