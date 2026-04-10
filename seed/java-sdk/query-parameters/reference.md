# Reference
## User
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
</dd>
</dl>


</dd>
</dl>
</details>

