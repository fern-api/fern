# Reference
## Nullable
<details><summary><code>client.nullable.getUsers() -> List&lt;User&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.nullable().getUsers(
    GetUsersRequest
        .builder()
        .usernames(
            Arrays.asList("usernames")
        )
        .activated(
            Arrays.asList(true)
        )
        .tags(
            Arrays.asList(Optional.of("tags"))
        )
        .avatar("avatar")
        .extra(true)
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

**usernames:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**avatar:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**activated:** `Optional<Boolean>` 
    
</dd>
</dl>

<dl>
<dd>

**tags:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**extra:** `Optional<Boolean>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullable.createUser(request) -> User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.nullable().createUser(
    CreateUserRequest
        .builder()
        .username("username")
        .tags(
            Optional.of(
                Arrays.asList("tags", "tags")
            )
        )
        .metadata(
            Metadata
                .builder()
                .createdAt(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                .updatedAt(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                .status(
                    Status.active()
                )
                .avatar("avatar")
                .activated(true)
                .values(
                    new HashMap<String, Optional<String>>() {{
                        put("values", Optional.of("values"));
                    }}
                )
                .build()
        )
        .avatar("avatar")
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

**username:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**tags:** `Optional<List<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**metadata:** `Optional<Metadata>` 
    
</dd>
</dl>

<dl>
<dd>

**avatar:** `Optional<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullable.deleteUser(request) -> Boolean</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.nullable().deleteUser(
    DeleteUserRequest
        .builder()
        .username("xy")
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

**username:** `Optional<String>` — The user to delete.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
