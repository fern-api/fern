# Reference
<details><summary><code>client.postWithNullableNamedRequestBodyType(pathId, request) -> ResponseBody</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.postWithNullableNamedRequestBodyType(
    "id",
    PostWithNullableNamedRequestBodyTypeRequest
        .builder()
        .body(
            Optional.empty()
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

**pathId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Optional<NullableObject>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.postWithNonNullableNamedRequestBodyType(pathId, request) -> ResponseBody</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.postWithNonNullableNamedRequestBodyType(
    "id",
    NonNullableObject
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

**pathId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**id:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**name:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**age:** `Optional<Integer>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

