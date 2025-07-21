# Reference
## User
<details><summary><code>client.user.getUsername() -> User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.user().getUsername(
    GetUsersRequest
        .builder()
        .limit(1)
        .id(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
        .date("2023-01-15")
        .deadline(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
        .bytes("SGVsbG8gd29ybGQh".getBytes())
        .user(
            User
                .builder()
                .name("name")
                .tags(
                    new ArrayList<String>(
                        Arrays.asList("tags", "tags")
                    )
                )
                .build()
        )
        .userList(
            new ArrayList<User>(
                Arrays.asList(
                    User
                        .builder()
                        .name("name")
                        .tags(
                            new ArrayList<String>(
                                Arrays.asList("tags", "tags")
                            )
                        )
                        .build(),
                    User
                        .builder()
                        .name("name")
                        .tags(
                            new ArrayList<String>(
                                Arrays.asList("tags", "tags")
                            )
                        )
                        .build()
                )
            )
        )
        .keyValue(
            new HashMap<String, String>() {{
                put("keyValue", "keyValue");
            }}
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
                            new ArrayList<String>(
                                Arrays.asList("tags", "tags")
                            )
                        )
                        .build()
                )
                .build()
        )
        .excludeUser(
            new ArrayList<User>(
                Arrays.asList(
                    User
                        .builder()
                        .name("name")
                        .tags(
                            new ArrayList<String>(
                                Arrays.asList("tags", "tags")
                            )
                        )
                        .build()
                )
            )
        )
        .filter(
            new ArrayList<String>(
                Arrays.asList("filter")
            )
        )
        .optionalDeadline(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
        .optionalString("optionalString")
        .optionalUser(
            User
                .builder()
                .name("name")
                .tags(
                    new ArrayList<String>(
                        Arrays.asList("tags", "tags")
                    )
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

**userList:** `List<User>` 
    
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

**excludeUser:** `User` 
    
</dd>
</dl>

<dl>
<dd>

**filter:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
