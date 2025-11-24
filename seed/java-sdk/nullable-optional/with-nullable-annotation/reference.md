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
        .email("email")
        .phone("phone")
        .address(
            Address
                .builder()
                .street("street")
                .zipCode("zipCode")
                .city("city")
                .state("state")
                .country("country")
                .buildingId("buildingId")
                .tenantId("tenantId")
                .build()
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
        .username("username")
        .email("email")
        .phone("phone")
        .address(
            Address
                .builder()
                .street("street")
                .zipCode("zipCode")
                .city("city")
                .state("state")
                .country("country")
                .buildingId("buildingId")
                .tenantId("tenantId")
                .build()
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
        .limit(1)
        .offset(1)
        .includeDeleted(true)
        .sortBy("sortBy")
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
        .department("department")
        .role("role")
        .isActive(true)
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
        .nullableRole(UserRole.ADMIN)
        .optionalRole(UserRole.ADMIN)
        .optionalNullableRole(UserRole.ADMIN)
        .nullableStatus(UserStatus.ACTIVE)
        .optionalStatus(UserStatus.ACTIVE)
        .optionalNullableStatus(UserStatus.ACTIVE)
        .nullableNotification(
            NotificationMethod.email(
                EmailNotification
                    .builder()
                    .emailAddress("emailAddress")
                    .subject("subject")
                    .htmlContent("htmlContent")
                    .build()
            )
        )
        .optionalNotification(
            NotificationMethod.email(
                EmailNotification
                    .builder()
                    .emailAddress("emailAddress")
                    .subject("subject")
                    .htmlContent("htmlContent")
                    .build()
            )
        )
        .optionalNullableNotification(
            NotificationMethod.email(
                EmailNotification
                    .builder()
                    .emailAddress("emailAddress")
                    .subject("subject")
                    .htmlContent("htmlContent")
                    .build()
            )
        )
        .nullableSearchResult(
            SearchResult.user(
                UserResponse
                    .builder()
                    .id("id")
                    .username("username")
                    .createdAt(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                    .email("email")
                    .phone("phone")
                    .updatedAt(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                    .address(
                        Address
                            .builder()
                            .street("street")
                            .zipCode("zipCode")
                            .city("city")
                            .state("state")
                            .country("country")
                            .buildingId("buildingId")
                            .tenantId("tenantId")
                            .build()
                    )
                    .build()
            )
        )
        .optionalSearchResult(
            SearchResult.user(
                UserResponse
                    .builder()
                    .id("id")
                    .username("username")
                    .createdAt(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                    .email("email")
                    .phone("phone")
                    .updatedAt(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                    .address(
                        Address
                            .builder()
                            .street("street")
                            .zipCode("zipCode")
                            .city("city")
                            .state("state")
                            .country("country")
                            .buildingId("buildingId")
                            .tenantId("tenantId")
                            .build()
                    )
                    .build()
            )
        )
        .nullableArray(
            Optional.of(
                Arrays.asList("nullableArray", "nullableArray")
            )
        )
        .optionalArray(
            Optional.of(
                Arrays.asList("optionalArray", "optionalArray")
            )
        )
        .optionalNullableArray(
            Optional.of(
                Arrays.asList("optionalNullableArray", "optionalNullableArray")
            )
        )
        .nullableListOfNullables(
            Optional.of(
                Arrays.asList("nullableListOfNullables", "nullableListOfNullables")
            )
        )
        .nullableMapOfNullables(
            new HashMap<String, Optional<Address>>() {{
                put("nullableMapOfNullables", Optional.of(
                    Address
                        .builder()
                        .street("street")
                        .zipCode("zipCode")
                        .city(Optional.of("city"))
                        .state(Optional.of("state"))
                        .country(Optional.of("country"))
                        .buildingId(Optional.of("buildingId"))
                        .tenantId(Optional.of("tenantId"))
                        .build()
                ));
            }}
        )
        .nullableListOfUnions(
            Optional.of(
                Arrays.asList(
                    NotificationMethod.email(
                        EmailNotification
                            .builder()
                            .emailAddress("emailAddress")
                            .subject("subject")
                            .htmlContent("htmlContent")
                            .build()
                    ),
                    NotificationMethod.email(
                        EmailNotification
                            .builder()
                            .emailAddress("emailAddress")
                            .subject("subject")
                            .htmlContent("htmlContent")
                            .build()
                    )
                )
            )
        )
        .optionalMapOfEnums(
            new HashMap<String, UserRole>() {{
                put("optionalMapOfEnums", UserRole.ADMIN);
            }}
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
        .nullableRole(UserRole.ADMIN)
        .nullableStatus(UserStatus.ACTIVE)
        .nullableNotification(
            NotificationMethod.email(
                EmailNotification
                    .builder()
                    .emailAddress("emailAddress")
                    .subject("subject")
                    .htmlContent("htmlContent")
                    .build()
            )
        )
        .nullableSearchResult(
            SearchResult.user(
                UserResponse
                    .builder()
                    .id("id")
                    .username("username")
                    .createdAt(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                    .email("email")
                    .phone("phone")
                    .updatedAt(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                    .address(
                        Address
                            .builder()
                            .street("street")
                            .zipCode("zipCode")
                            .city("city")
                            .state("state")
                            .country("country")
                            .buildingId("buildingId")
                            .tenantId("tenantId")
                            .build()
                    )
                    .build()
            )
        )
        .nullableArray(
            Optional.of(
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
        .nullableString("nullableString")
        .optionalString("optionalString")
        .optionalNullableString("optionalNullableString")
        .nullableEnum(UserRole.ADMIN)
        .optionalEnum(UserStatus.ACTIVE)
        .nullableUnion(
            NotificationMethod.email(
                EmailNotification
                    .builder()
                    .emailAddress("emailAddress")
                    .subject("subject")
                    .htmlContent("htmlContent")
                    .build()
            )
        )
        .optionalUnion(
            SearchResult.user(
                UserResponse
                    .builder()
                    .id("id")
                    .username("username")
                    .createdAt(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                    .email("email")
                    .phone("phone")
                    .updatedAt(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                    .address(
                        Address
                            .builder()
                            .street("street")
                            .zipCode("zipCode")
                            .city("city")
                            .state("state")
                            .country("country")
                            .buildingId("buildingId")
                            .tenantId("tenantId")
                            .build()
                    )
                    .build()
            )
        )
        .nullableList(
            Optional.of(
                Arrays.asList("nullableList", "nullableList")
            )
        )
        .nullableMap(
            new HashMap<String, Integer>() {{
                put("nullableMap", 1);
            }}
        )
        .nullableObject(
            Address
                .builder()
                .street("street")
                .zipCode("zipCode")
                .city("city")
                .state("state")
                .country("country")
                .buildingId("buildingId")
                .tenantId("tenantId")
                .build()
        )
        .optionalObject(
            Organization
                .builder()
                .id("id")
                .name("name")
                .domain("domain")
                .employeeCount(1)
                .build()
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
        .role(UserRole.ADMIN)
        .status(UserStatus.ACTIVE)
        .secondaryRole(UserRole.ADMIN)
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
            Optional.of(
                Arrays.asList("tags", "tags")
            )
        )
        .categories(
            Optional.of(
                Arrays.asList("categories", "categories")
            )
        )
        .labels(
            Optional.of(
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
            Optional.of(
                Arrays.asList("includeTypes", "includeTypes")
            )
        )
        .filters(
            new HashMap<String, Optional<String>>() {{
                put("filters", Optional.of("filters"));
            }}
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
