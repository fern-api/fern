# Reference
## Nullableoptional
<details><summary><code>client.Nullableoptional.<a href="/src/SeedApi/Nullableoptional/NullableoptionalClient.cs">GetuserAsync</a>(NullableOptionalGetUserRequest { ... }) -> WithRawResponseTask&lt;UserResponse&gt;</code></summary>
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
await client.Nullableoptional.GetuserAsync(
    new NullableOptionalGetUserRequest { UserId = "userId" }
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

**request:** `NullableOptionalGetUserRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Nullableoptional.<a href="/src/SeedApi/Nullableoptional/NullableoptionalClient.cs">UpdateuserAsync</a>(UpdateUserRequest { ... }) -> WithRawResponseTask&lt;UserResponse&gt;</code></summary>
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
await client.Nullableoptional.UpdateuserAsync(new UpdateUserRequest { UserId = "userId" });
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

**request:** `UpdateUserRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Nullableoptional.<a href="/src/SeedApi/Nullableoptional/NullableoptionalClient.cs">ListusersAsync</a>(NullableOptionalListUsersRequest { ... }) -> WithRawResponseTask&lt;IEnumerable&lt;UserResponse&gt;&gt;</code></summary>
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
await client.Nullableoptional.ListusersAsync(new NullableOptionalListUsersRequest());
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

**request:** `NullableOptionalListUsersRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Nullableoptional.<a href="/src/SeedApi/Nullableoptional/NullableoptionalClient.cs">CreateuserAsync</a>(CreateUserRequest { ... }) -> WithRawResponseTask&lt;UserResponse&gt;</code></summary>
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
await client.Nullableoptional.CreateuserAsync(new CreateUserRequest { Username = "username" });
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

<details><summary><code>client.Nullableoptional.<a href="/src/SeedApi/Nullableoptional/NullableoptionalClient.cs">SearchusersAsync</a>(NullableOptionalSearchUsersRequest { ... }) -> WithRawResponseTask&lt;IEnumerable&lt;UserResponse&gt;&gt;</code></summary>
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
await client.Nullableoptional.SearchusersAsync(
    new NullableOptionalSearchUsersRequest { Query = "query", Department = "department" }
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

**request:** `NullableOptionalSearchUsersRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Nullableoptional.<a href="/src/SeedApi/Nullableoptional/NullableoptionalClient.cs">CreatecomplexprofileAsync</a>(ComplexProfile { ... }) -> WithRawResponseTask&lt;ComplexProfile&gt;</code></summary>
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
await client.Nullableoptional.CreatecomplexprofileAsync(
    new ComplexProfile
    {
        Id = "id",
        NullableRole = UserRole.Admin,
        NullableStatus = UserStatus.Active,
        NullableNotification = new NotificationMethodZero
        {
            EmailAddress = "emailAddress",
            Subject = "subject",
            Type = NotificationMethodZeroType.Email,
        },
        NullableSearchResult = new SearchResultZero
        {
            Id = "id",
            Username = "username",
            CreatedAt = new DateTime(2024, 01, 15, 09, 30, 00, 000),
            Type = SearchResultZeroType.User,
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

<details><summary><code>client.Nullableoptional.<a href="/src/SeedApi/Nullableoptional/NullableoptionalClient.cs">GetcomplexprofileAsync</a>(NullableOptionalGetComplexProfileRequest { ... }) -> WithRawResponseTask&lt;ComplexProfile&gt;</code></summary>
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
await client.Nullableoptional.GetcomplexprofileAsync(
    new NullableOptionalGetComplexProfileRequest { ProfileId = "profileId" }
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

**request:** `NullableOptionalGetComplexProfileRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Nullableoptional.<a href="/src/SeedApi/Nullableoptional/NullableoptionalClient.cs">UpdatecomplexprofileAsync</a>(NullableOptionalUpdateComplexProfileRequest { ... }) -> WithRawResponseTask&lt;ComplexProfile&gt;</code></summary>
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
await client.Nullableoptional.UpdatecomplexprofileAsync(
    new NullableOptionalUpdateComplexProfileRequest { ProfileId = "profileId" }
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

**request:** `NullableOptionalUpdateComplexProfileRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Nullableoptional.<a href="/src/SeedApi/Nullableoptional/NullableoptionalClient.cs">TestdeserializationAsync</a>(DeserializationTestRequest { ... }) -> WithRawResponseTask&lt;DeserializationTestResponse&gt;</code></summary>
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
await client.Nullableoptional.TestdeserializationAsync(
    new DeserializationTestRequest
    {
        RequiredString = "requiredString",
        NullableEnum = UserRole.Admin,
        NullableUnion = new NotificationMethodZero
        {
            EmailAddress = "emailAddress",
            Subject = "subject",
            Type = NotificationMethodZeroType.Email,
        },
        NullableObject = new Address { Street = "street", ZipCode = "zipCode" },
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

<details><summary><code>client.Nullableoptional.<a href="/src/SeedApi/Nullableoptional/NullableoptionalClient.cs">FilterbyroleAsync</a>(NullableOptionalFilterByRoleRequest { ... }) -> WithRawResponseTask&lt;IEnumerable&lt;UserResponse&gt;&gt;</code></summary>
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
await client.Nullableoptional.FilterbyroleAsync(
    new NullableOptionalFilterByRoleRequest { Role = UserRole.Admin }
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

**request:** `NullableOptionalFilterByRoleRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Nullableoptional.<a href="/src/SeedApi/Nullableoptional/NullableoptionalClient.cs">GetnotificationsettingsAsync</a>(NullableOptionalGetNotificationSettingsRequest { ... }) -> WithRawResponseTask&lt;OneOf&lt;NotificationMethodZero, NotificationMethodOne, NotificationMethodTwo&gt;&gt;</code></summary>
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
await client.Nullableoptional.GetnotificationsettingsAsync(
    new NullableOptionalGetNotificationSettingsRequest { UserId = "userId" }
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

**request:** `NullableOptionalGetNotificationSettingsRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Nullableoptional.<a href="/src/SeedApi/Nullableoptional/NullableoptionalClient.cs">UpdatetagsAsync</a>(NullableOptionalUpdateTagsRequest { ... }) -> WithRawResponseTask&lt;IEnumerable&lt;string&gt;&gt;</code></summary>
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
await client.Nullableoptional.UpdatetagsAsync(
    new NullableOptionalUpdateTagsRequest { UserId = "userId" }
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

**request:** `NullableOptionalUpdateTagsRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Nullableoptional.<a href="/src/SeedApi/Nullableoptional/NullableoptionalClient.cs">GetsearchresultsAsync</a>(NullableOptionalGetSearchResultsRequest { ... }) -> WithRawResponseTask&lt;IEnumerable&lt;OneOf&lt;SearchResultZero, SearchResultOne, SearchResultTwo&gt;&gt;?&gt;</code></summary>
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
await client.Nullableoptional.GetsearchresultsAsync(
    new NullableOptionalGetSearchResultsRequest { Query = "query" }
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

**request:** `NullableOptionalGetSearchResultsRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

