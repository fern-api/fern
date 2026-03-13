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
            OptionalNullable.of("")
        )
        .limit(
            OptionalNullable.of(1)
        )
        .includeArchived(
            OptionalNullable.of(true)
        )
        .sortOrder(
            OptionalNullable.of(SortOrder.ASC)
        )
        .optionalWithoutDefault(
            OptionalNullable.of("optionalWithoutDefault")
        )
        .regularOptional(
            OptionalNullable.of("default-value")
        )
        .regularOptionalNoDefault(
            OptionalNullable.of("regularOptionalNoDefault")
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
</dd>
</dl>


</dd>
</dl>
</details>

