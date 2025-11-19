# Reference
## Optional
<details><summary><code>client.optional.sendOptionalBody(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.optional().sendOptionalBody(
    Optional.of(
        new HashMap<String, Object>() {{
            put("string", new 
            HashMap<String, Object>() {{put("key", "value");
            }});
        }}
    )
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

**request:** `Optional<Map<String, Object>>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.optional.sendOptionalTypedBody(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.optional().sendOptionalTypedBody(
    Optional.of(
        SendOptionalBodyRequest
            .builder()
            .message("message")
            .build()
    )
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

**request:** `Optional<SendOptionalBodyRequest>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.optional.sendOptionalNullableWithAllOptionalProperties(actionId, id, request) -> DeployResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Tests optional(nullable(T)) where T has only optional properties.
This should not generate wire tests expecting {} when Optional.empty() is passed.
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
client.optional().sendOptionalNullableWithAllOptionalProperties(
    "actionId",
    "id",
    DeployParams
        .builder()
        .updateDraft(true)
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

**actionId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Optional<DeployParams>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
