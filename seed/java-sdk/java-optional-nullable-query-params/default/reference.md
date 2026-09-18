# Reference
<details><summary><code>client.search() -> SearchResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Search endpoint with optional nullable query params with defaults
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
client.search(
    SearchRequest
        .builder()
        .query(
            OptionalNullable.of("query")
        )
        .sortOrders(
            Arrays.asList(SortOrder.ASC, SortOrder.DESC)
        )
        .tags(
            Arrays.asList("tag1", "tag2")
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

**query:** `Optional<String>` — Search query - defaults to empty string when absent
    
</dd>
</dl>

<dl>
<dd>

**limit:** `Optional<Integer>` — Max results - defaults to 10 when absent
    
</dd>
</dl>

<dl>
<dd>

**includeArchived:** `Optional<Boolean>` — Include archived items - defaults to false when absent
    
</dd>
</dl>

<dl>
<dd>

**sortOrder:** `Optional<SortOrder>` — Sort order - defaults to ASC when absent
    
</dd>
</dl>

<dl>
<dd>

**optionalWithoutDefault:** `Optional<String>` — Optional nullable without default - should check wasSpecified
    
</dd>
</dl>

<dl>
<dd>

**regularOptional:** `Optional<String>` — Another optional nullable with default for comparison
    
</dd>
</dl>

<dl>
<dd>

**regularOptionalNoDefault:** `Optional<String>` — Another optional nullable without default for comparison
    
</dd>
</dl>

<dl>
<dd>

**sortOrders:** `Optional<SortOrder>` — Optional array of enum values
    
</dd>
</dl>

<dl>
<dd>

**tags:** `Optional<String>` — Optional array of string values
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

