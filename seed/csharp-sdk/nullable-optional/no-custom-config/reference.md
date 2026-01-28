# Reference
## NullableOptional
<details><summary><code>client.NullableOptional.<a href="/src/SeedNullableOptional/NullableOptional/NullableOptionalClient.cs">GetUserAsync</a>(userId) -> WithRawResponseTask&lt;UserResponse&gt;</code></summary>
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

<details><summary><code>client.NullableOptional.<a href="/src/SeedNullableOptional/NullableOptional/NullableOptionalClient.cs">CreateUserAsync</a>(CreateUserRequest { ... }) -> WithRawResponseTask&lt;UserResponse&gt;</code></summary>
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
            BuildingId = "buildingId",
            TenantId = "tenantId",
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

<details><summary><code>client.NullableOptional.<a href="/src/SeedNullableOptional/NullableOptional/NullableOptionalClient.cs">UpdateUserAsync</a>(userId, UpdateUserRequest { ... }) -> WithRawResponseTask&lt;UserResponse&gt;</code></summary>
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
            BuildingId = "buildingId",
            TenantId = "tenantId",
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

<details><summary><code>client.NullableOptional.<a href="/src/SeedNullableOptional/NullableOptional/NullableOptionalClient.cs">ListUsersAsync</a>(ListUsersRequest { ... }) -> WithRawResponseTask&lt;IEnumerable&lt;UserResponse&gt;&gt;</code></summary>
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

<details><summary><code>client.NullableOptional.<a href="/src/SeedNullableOptional/NullableOptional/NullableOptionalClient.cs">SearchUsersAsync</a>(SearchUsersRequest { ... }) -> WithRawResponseTask&lt;IEnumerable&lt;UserResponse&gt;&gt;</code></summary>
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

<details><summary><code>client.NullableOptional.<a href="/src/SeedNullableOptional/NullableOptional/NullableOptionalClient.cs">CreateComplexProfileAsync</a>(ComplexProfile { ... }) -> WithRawResponseTask&lt;ComplexProfile&gt;</code></summary>
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

```csharp
await client.NullableOptional.CreateComplexProfileAsync(
    new ComplexProfile
    {
        Id = "id",
        NullableRole = UserRole.Admin,
        OptionalRole = UserRole.Admin,
        OptionalNullableRole = UserRole.Admin,
        NullableStatus = UserStatus.Active,
        OptionalStatus = UserStatus.Active,
        OptionalNullableStatus = UserStatus.Active,
        NullableNotification = new NotificationMethod(
            new NotificationMethod.Email(
                new EmailNotification
                {
                    EmailAddress = "emailAddress",
                    Subject = "subject",
                    HtmlContent = "htmlContent",
                }
            )
        ),
        OptionalNotification = new NotificationMethod(
            new NotificationMethod.Email(
                new EmailNotification
                {
                    EmailAddress = "emailAddress",
                    Subject = "subject",
                    HtmlContent = "htmlContent",
                }
            )
        ),
        OptionalNullableNotification = new NotificationMethod(
            new NotificationMethod.Email(
                new EmailNotification
                {
                    EmailAddress = "emailAddress",
                    Subject = "subject",
                    HtmlContent = "htmlContent",
                }
            )
        ),
        NullableSearchResult = new SearchResult(
            new SearchResult.User(
                new UserResponse
                {
                    Id = "id",
                    Username = "username",
                    Email = "email",
                    Phone = "phone",
                    CreatedAt = new DateTime(2024, 01, 15, 09, 30, 00, 000),
                    UpdatedAt = new DateTime(2024, 01, 15, 09, 30, 00, 000),
                    Address = new Address
                    {
                        Street = "street",
                        City = "city",
                        State = "state",
                        ZipCode = "zipCode",
                        Country = "country",
                        BuildingId = "buildingId",
                        TenantId = "tenantId",
                    },
                }
            )
        ),
        OptionalSearchResult = new SearchResult(
            new SearchResult.User(
                new UserResponse
                {
                    Id = "id",
                    Username = "username",
                    Email = "email",
                    Phone = "phone",
                    CreatedAt = new DateTime(2024, 01, 15, 09, 30, 00, 000),
                    UpdatedAt = new DateTime(2024, 01, 15, 09, 30, 00, 000),
                    Address = new Address
                    {
                        Street = "street",
                        City = "city",
                        State = "state",
                        ZipCode = "zipCode",
                        Country = "country",
                        BuildingId = "buildingId",
                        TenantId = "tenantId",
                    },
                }
            )
        ),
        NullableArray = new List<string>() { "nullableArray", "nullableArray" },
        OptionalArray = new List<string>() { "optionalArray", "optionalArray" },
        OptionalNullableArray = new List<string>()
        {
            "optionalNullableArray",
            "optionalNullableArray",
        },
        NullableListOfNullables = new List<string?>()
        {
            "nullableListOfNullables",
            "nullableListOfNullables",
        },
        NullableMapOfNullables = new Dictionary<string, Address?>()
        {
            {
                "nullableMapOfNullables",
                new Address
                {
                    Street = "street",
                    City = "city",
                    State = "state",
                    ZipCode = "zipCode",
                    Country = "country",
                    BuildingId = "buildingId",
                    TenantId = "tenantId",
                }
            },
        },
        NullableListOfUnions = new List<NotificationMethod>()
        {
            new NotificationMethod(
                new NotificationMethod.Email(
                    new EmailNotification
                    {
                        EmailAddress = "emailAddress",
                        Subject = "subject",
                        HtmlContent = "htmlContent",
                    }
                )
            ),
            new NotificationMethod(
                new NotificationMethod.Email(
                    new EmailNotification
                    {
                        EmailAddress = "emailAddress",
                        Subject = "subject",
                        HtmlContent = "htmlContent",
                    }
                )
            ),
        },
        OptionalMapOfEnums = new Dictionary<string, UserRole>()
        {
            { "optionalMapOfEnums", UserRole.Admin },
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

**request:** `ComplexProfile` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.NullableOptional.<a href="/src/SeedNullableOptional/NullableOptional/NullableOptionalClient.cs">GetComplexProfileAsync</a>(profileId) -> WithRawResponseTask&lt;ComplexProfile&gt;</code></summary>
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

```csharp
await client.NullableOptional.GetComplexProfileAsync("profileId");
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

<details><summary><code>client.NullableOptional.<a href="/src/SeedNullableOptional/NullableOptional/NullableOptionalClient.cs">UpdateComplexProfileAsync</a>(profileId, UpdateComplexProfileRequest { ... }) -> WithRawResponseTask&lt;ComplexProfile&gt;</code></summary>
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

```csharp
await client.NullableOptional.UpdateComplexProfileAsync(
    "profileId",
    new UpdateComplexProfileRequest
    {
        NullableRole = UserRole.Admin,
        NullableStatus = UserStatus.Active,
        NullableNotification = new NotificationMethod(
            new NotificationMethod.Email(
                new EmailNotification
                {
                    EmailAddress = "emailAddress",
                    Subject = "subject",
                    HtmlContent = "htmlContent",
                }
            )
        ),
        NullableSearchResult = new SearchResult(
            new SearchResult.User(
                new UserResponse
                {
                    Id = "id",
                    Username = "username",
                    Email = "email",
                    Phone = "phone",
                    CreatedAt = new DateTime(2024, 01, 15, 09, 30, 00, 000),
                    UpdatedAt = new DateTime(2024, 01, 15, 09, 30, 00, 000),
                    Address = new Address
                    {
                        Street = "street",
                        City = "city",
                        State = "state",
                        ZipCode = "zipCode",
                        Country = "country",
                        BuildingId = "buildingId",
                        TenantId = "tenantId",
                    },
                }
            )
        ),
        NullableArray = new List<string>() { "nullableArray", "nullableArray" },
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

**profileId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `UpdateComplexProfileRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.NullableOptional.<a href="/src/SeedNullableOptional/NullableOptional/NullableOptionalClient.cs">TestDeserializationAsync</a>(DeserializationTestRequest { ... }) -> WithRawResponseTask&lt;DeserializationTestResponse&gt;</code></summary>
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

```csharp
await client.NullableOptional.TestDeserializationAsync(
    new DeserializationTestRequest
    {
        RequiredString = "requiredString",
        NullableString = "nullableString",
        OptionalString = "optionalString",
        OptionalNullableString = "optionalNullableString",
        NullableEnum = UserRole.Admin,
        OptionalEnum = UserStatus.Active,
        NullableUnion = new NotificationMethod(
            new NotificationMethod.Email(
                new EmailNotification
                {
                    EmailAddress = "emailAddress",
                    Subject = "subject",
                    HtmlContent = "htmlContent",
                }
            )
        ),
        OptionalUnion = new SearchResult(
            new SearchResult.User(
                new UserResponse
                {
                    Id = "id",
                    Username = "username",
                    Email = "email",
                    Phone = "phone",
                    CreatedAt = new DateTime(2024, 01, 15, 09, 30, 00, 000),
                    UpdatedAt = new DateTime(2024, 01, 15, 09, 30, 00, 000),
                    Address = new Address
                    {
                        Street = "street",
                        City = "city",
                        State = "state",
                        ZipCode = "zipCode",
                        Country = "country",
                        BuildingId = "buildingId",
                        TenantId = "tenantId",
                    },
                }
            )
        ),
        NullableList = new List<string>() { "nullableList", "nullableList" },
        NullableMap = new Dictionary<string, int>() { { "nullableMap", 1 } },
        NullableObject = new Address
        {
            Street = "street",
            City = "city",
            State = "state",
            ZipCode = "zipCode",
            Country = "country",
            BuildingId = "buildingId",
            TenantId = "tenantId",
        },
        OptionalObject = new Organization
        {
            Id = "id",
            Name = "name",
            Domain = "domain",
            EmployeeCount = 1,
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

**request:** `DeserializationTestRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.NullableOptional.<a href="/src/SeedNullableOptional/NullableOptional/NullableOptionalClient.cs">FilterByRoleAsync</a>(FilterByRoleRequest { ... }) -> WithRawResponseTask&lt;IEnumerable&lt;UserResponse&gt;&gt;</code></summary>
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

```csharp
await client.NullableOptional.FilterByRoleAsync(
    new FilterByRoleRequest
    {
        Role = UserRole.Admin,
        Status = UserStatus.Active,
        SecondaryRole = UserRole.Admin,
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

**request:** `FilterByRoleRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.NullableOptional.<a href="/src/SeedNullableOptional/NullableOptional/NullableOptionalClient.cs">GetNotificationSettingsAsync</a>(userId) -> WithRawResponseTask&lt;NotificationMethod?&gt;</code></summary>
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

```csharp
await client.NullableOptional.GetNotificationSettingsAsync("userId");
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

<details><summary><code>client.NullableOptional.<a href="/src/SeedNullableOptional/NullableOptional/NullableOptionalClient.cs">UpdateTagsAsync</a>(userId, UpdateTagsRequest { ... }) -> WithRawResponseTask&lt;IEnumerable&lt;string&gt;&gt;</code></summary>
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

```csharp
await client.NullableOptional.UpdateTagsAsync(
    "userId",
    new UpdateTagsRequest
    {
        Tags = new List<string>() { "tags", "tags" },
        Categories = new List<string>() { "categories", "categories" },
        Labels = new List<string>() { "labels", "labels" },
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

**request:** `UpdateTagsRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.NullableOptional.<a href="/src/SeedNullableOptional/NullableOptional/NullableOptionalClient.cs">GetSearchResultsAsync</a>(SearchRequest { ... }) -> WithRawResponseTask&lt;IEnumerable&lt;SearchResult&gt;?&gt;</code></summary>
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

```csharp
await client.NullableOptional.GetSearchResultsAsync(
    new SearchRequest
    {
        Query = "query",
        Filters = new Dictionary<string, string?>() { { "filters", "filters" } },
        IncludeTypes = new List<string>() { "includeTypes", "includeTypes" },
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

**request:** `SearchRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
