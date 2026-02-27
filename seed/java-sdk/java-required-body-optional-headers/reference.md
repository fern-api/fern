# Reference
<details><summary><code>client.createUser(request) -> User</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Create a new user. Has required body and optional header.
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
client.createUser(
    CreateUserRequest
        .builder()
        .body(
            UserData
                .builder()
                .name("name")
                .email("email")
                .age(1)
                .build()
        )
        .xCorrelationId("X-Correlation-Id")
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

**xCorrelationId:** `Optional<String>` — Optional correlation ID for request tracing
    
</dd>
</dl>

<dl>
<dd>

**request:** `UserData` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.updateUser(userId, request) -> User</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Update an existing user. Has required body and optional query param.
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
client.updateUser(
    "userId",
    UpdateUserRequest
        .builder()
        .body(
            UserData
                .builder()
                .name("name")
                .email("email")
                .age(1)
                .build()
        )
        .dryRun(true)
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

**dryRun:** `Optional<Boolean>` — If true, validate the update without persisting
    
</dd>
</dl>

<dl>
<dd>

**request:** `UserData` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.createUserWithOptions(request) -> User</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Create a user with optional header and query param.
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
client.createUserWithOptions(
    CreateUserWithOptionsRequest
        .builder()
        .body(
            UserData
                .builder()
                .name("name")
                .email("email")
                .age(1)
                .build()
        )
        .xRequestId("X-Request-Id")
        .validate(true)
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

**validate:** `Optional<Boolean>` — Whether to validate the request
    
</dd>
</dl>

<dl>
<dd>

**xRequestId:** `Optional<String>` — Optional request ID
    
</dd>
</dl>

<dl>
<dd>

**request:** `UserData` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.createUserWithRequiredHeader(request) -> User</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Create a user with required header.
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
client.createUserWithRequiredHeader(
    CreateUserWithRequiredHeaderRequest
        .builder()
        .xApiKey("X-Api-Key")
        .body(
            UserData
                .builder()
                .name("name")
                .email("email")
                .age(1)
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

**xApiKey:** `String` — Required API key header
    
</dd>
</dl>

<dl>
<dd>

**request:** `UserData` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.createUserWithRequiredQuery(request) -> User</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Create a user with required query param.
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
client.createUserWithRequiredQuery(
    CreateUserWithRequiredQueryRequest
        .builder()
        .tenantId("tenantId")
        .body(
            UserData
                .builder()
                .name("name")
                .email("email")
                .age(1)
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

**tenantId:** `String` — Required tenant ID
    
</dd>
</dl>

<dl>
<dd>

**request:** `UserData` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.getUsers() -> List&amp;lt;User&amp;gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get all users with optional filtering.
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
client.getUsers(
    GetUsersRequest
        .builder()
        .limit(1)
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

**limit:** `Optional<Integer>` — Maximum number of users to return
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.createUserInlined(request) -> User</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Create a user with inlined body and optional header.
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
client.createUserInlined(
    CreateUserInlinedRequest
        .builder()
        .name("name")
        .email("email")
        .xTraceId("X-Trace-Id")
        .age(1)
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

**xTraceId:** `Optional<String>` — Optional trace ID for request tracing
    
</dd>
</dl>

<dl>
<dd>

**name:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**email:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**age:** `Optional<Integer>` — User's age
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

