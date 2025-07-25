# Reference
<details><summary><code>client.search() -> SearchResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.search(
    SearchRequest
        .builder()
        .limit(1)
        .id("id")
        .date("date")
        .deadline(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
        .bytes("bytes")
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
            new ArrayList<Optional<User>>(
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
        .excludeUser(
            new ArrayList<Optional<User>>(
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
            new ArrayList<Optional<String>>(
                Arrays.asList("filter")
            )
        )
        .neighborRequired(
            SearchRequestNeighborRequired.ofUser(
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
        .optionalDeadline(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
        .keyValue(
            new HashMap<String, Optional<String>>() {{
                put("keyValue", Optional.of("keyValue"));
            }}
        )
        .optionalString("optionalString")
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
        .neighbor(
            SearchRequestNeighbor.ofUser(
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

**keyValue:** `Optional<Map<String, Optional<String>>>` 
    
</dd>
</dl>

<dl>
<dd>

**optionalString:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**nestedUser:** `Optional<NestedUser>` 
    
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

**neighbor:** `Optional<SearchRequestNeighbor>` 
    
</dd>
</dl>

<dl>
<dd>

**neighborRequired:** `SearchRequestNeighborRequired` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
