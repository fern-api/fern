# Reference
## User
<details><summary><code>client.user.createusername(request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.user().createusername(
    UserCreateUsernameRequest
        .builder()
        .username("username")
        .password("password")
        .name("name")
        .tags(
            Arrays.asList("tags")
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

**tags:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**username:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**password:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**name:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.user.createusernamewithreferencedtype(request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.user().createusernamewithreferencedtype(
    CreateUsernameBody
        .builder()
        .username("username")
        .password("password")
        .name("name")
        .tags(
            Arrays.asList("tags")
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

**tags:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**username:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**password:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**name:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.user.createusernameoptional(request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.user().createusernameoptional(
    CreateUsernameBodyOptionalProperties
        .builder()
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

**username:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**password:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**name:** `Optional<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.user.getusername() -> User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.user().getusername(
    UserGetUsernameRequest
        .builder()
        .limit(1)
        .id("id")
        .date("2023-01-15")
        .deadline(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
        .bytes("bytes")
        .user(
            User
                .builder()
                .name("name")
                .tags(
                    Arrays.asList("tags", "tags")
                )
                .build()
        )
        .nestedUser(
            NestedUser
                .builder()
                .name("name")
                .user(
                    User
                        .builder()
                        .name("name")
                        .tags(
                            Arrays.asList("tags", "tags")
                        )
                        .build()
                )
                .build()
        )
        .longParam(1000000L)
        .bigIntParam(1)
        .userList(
            Arrays.asList(
                User
                    .builder()
                    .name("name")
                    .tags(
                        Arrays.asList("tags", "tags")
                    )
                    .build()
            )
        )
        .keyValue(
            new HashMap<String, String>() {{
                put("keyValue", "keyValue");
            }}
        )
        .excludeUser(
            Arrays.asList(
                User
                    .builder()
                    .name("name")
                    .tags(
                        Arrays.asList("tags", "tags")
                    )
                    .build()
            )
        )
        .filter(
            Arrays.asList("filter")
        )
        .optionalDeadline(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
        .optionalString("optionalString")
        .optionalUser(
            User
                .builder()
                .name("name")
                .tags(
                    Arrays.asList("tags", "tags")
                )
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

**limit:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**date:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**deadline:** `OffsetDateTime` 
    
</dd>
</dl>

<dl>
<dd>

**bytes:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**user:** `User` 
    
</dd>
</dl>

<dl>
<dd>

**userList:** `Optional<User>` 
    
</dd>
</dl>

<dl>
<dd>

**optionalDeadline:** `Optional<OffsetDateTime>` 
    
</dd>
</dl>

<dl>
<dd>

**keyValue:** `Map<String, String>` 
    
</dd>
</dl>

<dl>
<dd>

**optionalString:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**nestedUser:** `NestedUser` 
    
</dd>
</dl>

<dl>
<dd>

**optionalUser:** `Optional<User>` 
    
</dd>
</dl>

<dl>
<dd>

**excludeUser:** `Optional<User>` 
    
</dd>
</dl>

<dl>
<dd>

**filter:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**longParam:** `Long` 
    
</dd>
</dl>

<dl>
<dd>

**bigIntParam:** `Integer` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

