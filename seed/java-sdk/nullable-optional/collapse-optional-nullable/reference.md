# Reference
## NullableOptional
<details><summary><code>client.nullableOptional.getUser(userId) -> UserResponse</code></summary>
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

```java
client.nullableOptional().getUser("userId");
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

<details><summary><code>client.nullableOptional.createUser(request) -> UserResponse</code></summary>
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

```java
client.nullableOptional().createUser(
    CreateUserRequest
        .builder()
        .username("username")
        .email(
            OptionalNullable.of("email")
        )
        .phone(
            OptionalNullable.of("phone")
        )
        .address(
            OptionalNullable.of(
                Address
                    .builder()
                    .street("street")
                    .city(
                        OptionalNullable.of("city")
                    )
                    .state(
                        OptionalNullable.of("state")
                    )
                    .zipCode("zipCode")
                    .country(
                        OptionalNullable.of("country")
                    )
                    .buildingId(
                        OptionalNullable.of("buildingId")
                    )
                    .tenantId(
                        OptionalNullable.of("tenantId")
                    )
                    .build()
            )
        )
        .build()
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

<details><summary><code>client.nullableOptional.updateUser(userId, request) -> UserResponse</code></summary>
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

```java
client.nullableOptional().updateUser(
    "userId",
    UpdateUserRequest
        .builder()
        .username(
            OptionalNullable.of("username")
        )
        .email(
            OptionalNullable.of("email")
        )
        .phone(
            OptionalNullable.of("phone")
        )
        .address(
            OptionalNullable.of(
                Address
                    .builder()
                    .street("street")
                    .city(
                        OptionalNullable.of("city")
                    )
                    .state(
                        OptionalNullable.of("state")
                    )
                    .zipCode("zipCode")
                    .country(
                        OptionalNullable.of("country")
                    )
                    .buildingId(
                        OptionalNullable.of("buildingId")
                    )
                    .tenantId(
                        OptionalNullable.of("tenantId")
                    )
                    .build()
            )
        )
        .build()
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

**userId:** `String` 
    
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

<details><summary><code>client.nullableOptional.listUsers() -> List&lt;UserResponse&gt;</code></summary>
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

```java
client.nullableOptional().listUsers(
    ListUsersRequest
        .builder()
        .limit(
            OptionalNullable.of(1)
        )
        .offset(
            OptionalNullable.of(1)
        )
        .includeDeleted(
            OptionalNullable.of(true)
        )
        .sortBy(
            OptionalNullable.of("sortBy")
        )
        .build()
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

**limit:** `Optional<Integer>` 
    
</dd>
</dl>

<dl>
<dd>

**offset:** `Optional<Integer>` 
    
</dd>
</dl>

<dl>
<dd>

**includeDeleted:** `Optional<Boolean>` 
    
</dd>
</dl>

<dl>
<dd>

**sortBy:** `Optional<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableOptional.searchUsers() -> List&lt;UserResponse&gt;</code></summary>
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

```java
client.nullableOptional().searchUsers(
    SearchUsersRequest
        .builder()
        .query("query")
        .department(
            OptionalNullable.of("department")
        )
        .role(
            OptionalNullable.of("role")
        )
        .isActive(
            OptionalNullable.of(true)
        )
        .build()
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

**department:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**role:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**isActive:** `Optional<Boolean>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableOptional.createComplexProfile(request) -> ComplexProfile</code></summary>
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

```java
client.nullableOptional().createComplexProfile(
    ComplexProfile
        .builder()
        .id("id")
        .nullableRole(
            OptionalNullable.of(UserRole.ADMIN)
        )
        .optionalRole(
            OptionalNullable.of(UserRole.ADMIN)
        )
        .optionalNullableRole(
            OptionalNullable.of(UserRole.ADMIN)
        )
        .nullableStatus(
            OptionalNullable.of(UserStatus.ACTIVE)
        )
        .optionalStatus(
            OptionalNullable.of(UserStatus.ACTIVE)
        )
        .optionalNullableStatus(
            OptionalNullable.of(UserStatus.ACTIVE)
        )
        .nullableNotification(
            OptionalNullable.of(
                NotificationMethod.email(
                    EmailNotification
                        .builder()
                        .emailAddress("emailAddress")
                        .subject("subject")
                        .htmlContent(
                            OptionalNullable.of("htmlContent")
                        )
                        .build()
                )
            )
        )
        .optionalNotification(
            OptionalNullable.of(
                NotificationMethod.email(
                    EmailNotification
                        .builder()
                        .emailAddress("emailAddress")
                        .subject("subject")
                        .htmlContent(
                            OptionalNullable.of("htmlContent")
                        )
                        .build()
                )
            )
        )
        .optionalNullableNotification(
            OptionalNullable.of(
                NotificationMethod.email(
                    EmailNotification
                        .builder()
                        .emailAddress("emailAddress")
                        .subject("subject")
                        .htmlContent(
                            OptionalNullable.of("htmlContent")
                        )
                        .build()
                )
            )
        )
        .nullableSearchResult(
            OptionalNullable.of(
                SearchResult.user(
                    UserResponse
                        .builder()
                        .id("id")
                        .username("username")
                        .email(
                            OptionalNullable.of("email")
                        )
                        .phone(
                            OptionalNullable.of("phone")
                        )
                        .createdAt(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                        .updatedAt(
                            OptionalNullable.of(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                        )
                        .address(
                            OptionalNullable.of(
                                Address
                                    .builder()
                                    .street("street")
                                    .city(
                                        OptionalNullable.of("city")
                                    )
                                    .state(
                                        OptionalNullable.of("state")
                                    )
                                    .zipCode("zipCode")
                                    .country(
                                        OptionalNullable.of("country")
                                    )
                                    .buildingId(
                                        OptionalNullable.of("buildingId")
                                    )
                                    .tenantId(
                                        OptionalNullable.of("tenantId")
                                    )
                                    .build()
                            )
                        )
                        .build()
                )
            )
        )
        .optionalSearchResult(
            OptionalNullable.of(
                SearchResult.user(
                    UserResponse
                        .builder()
                        .id("id")
                        .username("username")
                        .email(
                            OptionalNullable.of("email")
                        )
                        .phone(
                            OptionalNullable.of("phone")
                        )
                        .createdAt(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                        .updatedAt(
                            OptionalNullable.of(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                        )
                        .address(
                            OptionalNullable.of(
                                Address
                                    .builder()
                                    .street("street")
                                    .city(
                                        OptionalNullable.of("city")
                                    )
                                    .state(
                                        OptionalNullable.of("state")
                                    )
                                    .zipCode("zipCode")
                                    .country(
                                        OptionalNullable.of("country")
                                    )
                                    .buildingId(
                                        OptionalNullable.of("buildingId")
                                    )
                                    .tenantId(
                                        OptionalNullable.of("tenantId")
                                    )
                                    .build()
                            )
                        )
                        .build()
                )
            )
        )
        .nullableArray(
            OptionalNullable.of(
                Arrays.asList("nullableArray", "nullableArray")
            )
        )
        .optionalArray(
            OptionalNullable.of(
                Arrays.asList("optionalArray", "optionalArray")
            )
        )
        .optionalNullableArray(
            OptionalNullable.of(
                Arrays.asList("optionalNullableArray", "optionalNullableArray")
            )
        )
        .nullableListOfNullables(
            OptionalNullable.of(
                Arrays.asList(
                    OptionalNullable.of("nullableListOfNullables"),
                    OptionalNullable.of("nullableListOfNullables")
                )
            )
        )
        .nullableMapOfNullables(
            OptionalNullable.of(
                new HashMap<String, Optional<Address>>() {{
                    put("nullableMapOfNullables", OptionalNullable.of(
                        Address
                            .builder()
                            .street("street")
                            .city(
                                OptionalNullable.of("city")
                            )
                            .state(
                                OptionalNullable.of("state")
                            )
                            .zipCode("zipCode")
                            .country(
                                OptionalNullable.of("country")
                            )
                            .buildingId(
                                OptionalNullable.of("buildingId")
                            )
                            .tenantId(
                                OptionalNullable.of("tenantId")
                            )
                            .build()
                    ));
                }}
            )
        )
        .nullableListOfUnions(
            OptionalNullable.of(
                Arrays.asList(
                    NotificationMethod.email(
                        EmailNotification
                            .builder()
                            .emailAddress("emailAddress")
                            .subject("subject")
                            .htmlContent(
                                OptionalNullable.of("htmlContent")
                            )
                            .build()
                    ),
                    NotificationMethod.email(
                        EmailNotification
                            .builder()
                            .emailAddress("emailAddress")
                            .subject("subject")
                            .htmlContent(
                                OptionalNullable.of("htmlContent")
                            )
                            .build()
                    )
                )
            )
        )
        .optionalMapOfEnums(
            OptionalNullable.of(
                new HashMap<String, UserRole>() {{
                    put("optionalMapOfEnums", UserRole.ADMIN);
                }}
            )
        )
        .build()
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

<details><summary><code>client.nullableOptional.getComplexProfile(profileId) -> ComplexProfile</code></summary>
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

```java
client.nullableOptional().getComplexProfile("profileId");
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

<details><summary><code>client.nullableOptional.updateComplexProfile(profileId, request) -> ComplexProfile</code></summary>
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

```java
client.nullableOptional().updateComplexProfile(
    "profileId",
    UpdateComplexProfileRequest
        .builder()
        .nullableRole(
            OptionalNullable.of(UserRole.ADMIN)
        )
        .nullableStatus(
            OptionalNullable.of(UserStatus.ACTIVE)
        )
        .nullableNotification(
            OptionalNullable.of(
                NotificationMethod.email(
                    EmailNotification
                        .builder()
                        .emailAddress("emailAddress")
                        .subject("subject")
                        .htmlContent(
                            OptionalNullable.of("htmlContent")
                        )
                        .build()
                )
            )
        )
        .nullableSearchResult(
            OptionalNullable.of(
                SearchResult.user(
                    UserResponse
                        .builder()
                        .id("id")
                        .username("username")
                        .email(
                            OptionalNullable.of("email")
                        )
                        .phone(
                            OptionalNullable.of("phone")
                        )
                        .createdAt(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                        .updatedAt(
                            OptionalNullable.of(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                        )
                        .address(
                            OptionalNullable.of(
                                Address
                                    .builder()
                                    .street("street")
                                    .city(
                                        OptionalNullable.of("city")
                                    )
                                    .state(
                                        OptionalNullable.of("state")
                                    )
                                    .zipCode("zipCode")
                                    .country(
                                        OptionalNullable.of("country")
                                    )
                                    .buildingId(
                                        OptionalNullable.of("buildingId")
                                    )
                                    .tenantId(
                                        OptionalNullable.of("tenantId")
                                    )
                                    .build()
                            )
                        )
                        .build()
                )
            )
        )
        .nullableArray(
            OptionalNullable.of(
                Arrays.asList("nullableArray", "nullableArray")
            )
        )
        .build()
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

**profileId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**nullableRole:** `Optional<UserRole>` 
    
</dd>
</dl>

<dl>
<dd>

**nullableStatus:** `Optional<UserStatus>` 
    
</dd>
</dl>

<dl>
<dd>

**nullableNotification:** `Optional<NotificationMethod>` 
    
</dd>
</dl>

<dl>
<dd>

**nullableSearchResult:** `Optional<SearchResult>` 
    
</dd>
</dl>

<dl>
<dd>

**nullableArray:** `Optional<List<String>>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableOptional.testDeserialization(request) -> DeserializationTestResponse</code></summary>
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

```java
client.nullableOptional().testDeserialization(
    DeserializationTestRequest
        .builder()
        .requiredString("requiredString")
        .nullableString(
            OptionalNullable.of("nullableString")
        )
        .optionalString(
            OptionalNullable.of("optionalString")
        )
        .optionalNullableString(
            OptionalNullable.of("optionalNullableString")
        )
        .nullableEnum(
            OptionalNullable.of(UserRole.ADMIN)
        )
        .optionalEnum(
            OptionalNullable.of(UserStatus.ACTIVE)
        )
        .nullableUnion(
            OptionalNullable.of(
                NotificationMethod.email(
                    EmailNotification
                        .builder()
                        .emailAddress("emailAddress")
                        .subject("subject")
                        .htmlContent(
                            OptionalNullable.of("htmlContent")
                        )
                        .build()
                )
            )
        )
        .optionalUnion(
            OptionalNullable.of(
                SearchResult.user(
                    UserResponse
                        .builder()
                        .id("id")
                        .username("username")
                        .email(
                            OptionalNullable.of("email")
                        )
                        .phone(
                            OptionalNullable.of("phone")
                        )
                        .createdAt(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                        .updatedAt(
                            OptionalNullable.of(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                        )
                        .address(
                            OptionalNullable.of(
                                Address
                                    .builder()
                                    .street("street")
                                    .city(
                                        OptionalNullable.of("city")
                                    )
                                    .state(
                                        OptionalNullable.of("state")
                                    )
                                    .zipCode("zipCode")
                                    .country(
                                        OptionalNullable.of("country")
                                    )
                                    .buildingId(
                                        OptionalNullable.of("buildingId")
                                    )
                                    .tenantId(
                                        OptionalNullable.of("tenantId")
                                    )
                                    .build()
                            )
                        )
                        .build()
                )
            )
        )
        .nullableList(
            OptionalNullable.of(
                Arrays.asList("nullableList", "nullableList")
            )
        )
        .nullableMap(
            OptionalNullable.of(
                new HashMap<String, Integer>() {{
                    put("nullableMap", 1);
                }}
            )
        )
        .nullableObject(
            OptionalNullable.of(
                Address
                    .builder()
                    .street("street")
                    .city(
                        OptionalNullable.of("city")
                    )
                    .state(
                        OptionalNullable.of("state")
                    )
                    .zipCode("zipCode")
                    .country(
                        OptionalNullable.of("country")
                    )
                    .buildingId(
                        OptionalNullable.of("buildingId")
                    )
                    .tenantId(
                        OptionalNullable.of("tenantId")
                    )
                    .build()
            )
        )
        .optionalObject(
            OptionalNullable.of(
                Organization
                    .builder()
                    .id("id")
                    .name("name")
                    .domain(
                        OptionalNullable.of("domain")
                    )
                    .employeeCount(
                        OptionalNullable.of(1)
                    )
                    .build()
            )
        )
        .build()
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

<details><summary><code>client.nullableOptional.filterByRole() -> List&lt;UserResponse&gt;</code></summary>
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

```java
client.nullableOptional().filterByRole(
    FilterByRoleRequest
        .builder()
        .role(
            OptionalNullable.of(UserRole.ADMIN)
        )
        .status(
            OptionalNullable.of(UserStatus.ACTIVE)
        )
        .secondaryRole(
            OptionalNullable.of(UserRole.ADMIN)
        )
        .build()
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

**role:** `Optional<UserRole>` 
    
</dd>
</dl>

<dl>
<dd>

**status:** `Optional<UserStatus>` 
    
</dd>
</dl>

<dl>
<dd>

**secondaryRole:** `Optional<UserRole>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableOptional.getNotificationSettings(userId) -> Optional&lt;NotificationMethod&gt;</code></summary>
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

```java
client.nullableOptional().getNotificationSettings("userId");
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

<details><summary><code>client.nullableOptional.updateTags(userId, request) -> List&lt;String&gt;</code></summary>
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

```java
client.nullableOptional().updateTags(
    "userId",
    UpdateTagsRequest
        .builder()
        .tags(
            OptionalNullable.of(
                Arrays.asList("tags", "tags")
            )
        )
        .categories(
            OptionalNullable.of(
                Arrays.asList("categories", "categories")
            )
        )
        .labels(
            OptionalNullable.of(
                Arrays.asList("labels", "labels")
            )
        )
        .build()
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

**userId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**tags:** `Optional<List<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**categories:** `Optional<List<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**labels:** `Optional<List<String>>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableOptional.getSearchResults(request) -> Optional&lt;List&lt;SearchResult&gt;&gt;</code></summary>
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

```java
client.nullableOptional().getSearchResults(
    SearchRequest
        .builder()
        .query("query")
        .includeTypes(
            OptionalNullable.of(
                Arrays.asList("includeTypes", "includeTypes")
            )
        )
        .filters(
            OptionalNullable.of(
                new HashMap<String, Optional<String>>() {{
                    put("filters", OptionalNullable.of("filters"));
                }}
            )
        )
        .build()
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

**filters:** `Optional<Map<String, Optional<String>>>` 
    
</dd>
</dl>

<dl>
<dd>

**includeTypes:** `Optional<List<String>>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
