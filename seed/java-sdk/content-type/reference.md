# Reference
## Service
<details><summary><code>client.service.patch(request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.service().patch(
    PatchProxyRequest
        .builder()
        .application("application")
        .requireAuth(true)
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

**application:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**requireAuth:** `Optional<Boolean>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.patchComplex(id, request)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Update with JSON merge patch - complex types.
This endpoint demonstrates the distinction between:
- optional<T> fields (can be present or absent, but not null)
- optional<nullable<T>> fields (can be present, absent, or null)
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
client.service().patchComplex(
    "id",
    PatchComplexRequest
        .builder()
        .name("name")
        .age(1)
        .active(true)
        .metadata(
            new HashMap<String, Object>() {{
                put("metadata", new 
                HashMap<String, Object>() {{put("key", "value");
                }});
            }}
        )
        .tags(
            Optional.of(
                Arrays.asList("tags", "tags")
            )
        )
        .email("email")
        .nickname("nickname")
        .bio("bio")
        .profileImageUrl("profileImageUrl")
        .settings(
            new HashMap<String, Object>() {{
                put("settings", new 
                HashMap<String, Object>() {{put("key", "value");
                }});
            }}
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

**id:** `String` 
    
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

<dl>
<dd>

**active:** `Optional<Boolean>` 
    
</dd>
</dl>

<dl>
<dd>

**metadata:** `Optional<Map<String, Object>>` 
    
</dd>
</dl>

<dl>
<dd>

**tags:** `Optional<List<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**email:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**nickname:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**bio:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**profileImageUrl:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**settings:** `Optional<Map<String, Object>>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.namedPatchWithMixed(id, request)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Named request with mixed optional/nullable fields and merge-patch content type.
This should trigger the NPE issue when optional fields aren't initialized.
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
client.service().namedPatchWithMixed(
    "id",
    NamedMixedPatchRequest
        .builder()
        .instructions("instructions")
        .active(true)
        .appId("appId")
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

**id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**appId:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**instructions:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**active:** `Optional<Boolean>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.optionalMergePatchTest(request)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Test endpoint to verify Optional field initialization and JsonSetter with Nulls.SKIP.
This endpoint should:
1. Not NPE when fields are not provided (tests initialization)
2. Not NPE when fields are explicitly null in JSON (tests Nulls.SKIP)
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
client.service().optionalMergePatchTest(
    OptionalMergePatchRequest
        .builder()
        .requiredField("requiredField")
        .nullableString("nullableString")
        .optionalString("optionalString")
        .optionalInteger(1)
        .optionalBoolean(true)
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

**requiredField:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**optionalString:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**optionalInteger:** `Optional<Integer>` 
    
</dd>
</dl>

<dl>
<dd>

**optionalBoolean:** `Optional<Boolean>` 
    
</dd>
</dl>

<dl>
<dd>

**nullableString:** `Optional<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.regularPatch(id, request)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Regular PATCH endpoint without merge-patch semantics
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
client.service().regularPatch(
    "id",
    RegularPatchRequest
        .builder()
        .field1("field1")
        .field2(1)
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

**id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**field1:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**field2:** `Optional<Integer>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
