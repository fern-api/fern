# Reference
## Endpoints Container
<details><summary><code>client.endpoints.container.getAndReturnListOfPrimitives(request) -> List&lt;String&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpoints().container().getAndReturnListOfPrimitives(
    Arrays.asList("string", "string")
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

**request:** `List<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.container.getAndReturnListOfObjects(request) -> List&lt;ObjectWithRequiredField&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpoints().container().getAndReturnListOfObjects(
    Arrays.asList(
        ObjectWithRequiredField
            .builder()
            .string("string")
            .build(),
        ObjectWithRequiredField
            .builder()
            .string("string")
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

**request:** `List<ObjectWithRequiredField>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.container.getAndReturnSetOfPrimitives(request) -> Set&lt;String&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpoints().container().getAndReturnSetOfPrimitives(
    new HashSet<String>(
        Arrays.asList("string")
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

**request:** `Set<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.container.getAndReturnSetOfObjects(request) -> Set&lt;ObjectWithRequiredField&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpoints().container().getAndReturnSetOfObjects(
    new HashSet<ObjectWithRequiredField>(
        Arrays.asList(
            ObjectWithRequiredField
                .builder()
                .string("string")
                .build()
        )
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

**request:** `Set<ObjectWithRequiredField>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.container.getAndReturnMapPrimToPrim(request) -> Map&lt;String, String&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpoints().container().getAndReturnMapPrimToPrim(
    new HashMap<String, String>() {{
        put("string", "string");
    }}
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

**request:** `Map<String, String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.container.getAndReturnMapOfPrimToObject(request) -> Map&lt;String, ObjectWithRequiredField&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpoints().container().getAndReturnMapOfPrimToObject(
    new HashMap<String, ObjectWithRequiredField>() {{
        put("string", ObjectWithRequiredField
            .builder()
            .string("string")
            .build());
    }}
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

**request:** `Map<String, ObjectWithRequiredField>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.container.getAndReturnOptional(request) -> Optional&lt;ObjectWithRequiredField&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpoints().container().getAndReturnOptional(
    Optional.empty()
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

**request:** `Optional<ObjectWithRequiredField>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints ContentType
<details><summary><code>client.endpoints.contentType.postJsonPatchContentType(request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpoints().contentType().postJsonPatchContentType(
    ObjectWithOptionalField
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

**request:** `ObjectWithOptionalField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.contentType.postJsonPatchContentWithCharsetType(request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpoints().contentType().postJsonPatchContentWithCharsetType(
    ObjectWithOptionalField
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

**request:** `ObjectWithOptionalField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Enum
<details><summary><code>client.endpoints.enum_.getAndReturnEnum(request) -> WeatherReport</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpoints().enum_().getAndReturnEnum(WeatherReport.SUNNY);
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

**request:** `WeatherReport` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints HttpMethods
<details><summary><code>client.endpoints.httpMethods.testGet(id) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpoints().httpMethods().testGet("id");
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.httpMethods.testPost(request) -> ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpoints().httpMethods().testPost(
    ObjectWithRequiredField
        .builder()
        .string("string")
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

**request:** `ObjectWithRequiredField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.httpMethods.testPut(id, request) -> ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpoints().httpMethods().testPut(
    "id",
    ObjectWithRequiredField
        .builder()
        .string("string")
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

**request:** `ObjectWithRequiredField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.httpMethods.testPatch(id, request) -> ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpoints().httpMethods().testPatch(
    "id",
    ObjectWithOptionalField
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

**id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `ObjectWithOptionalField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.httpMethods.testDelete(id) -> Boolean</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpoints().httpMethods().testDelete("id");
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
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Object
<details><summary><code>client.endpoints.object.getAndReturnWithOptionalField(request) -> ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpoints().object().getAndReturnWithOptionalField(
    ObjectWithOptionalField
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

**request:** `ObjectWithOptionalField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.object.getAndReturnWithRequiredField(request) -> ObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpoints().object().getAndReturnWithRequiredField(
    ObjectWithRequiredField
        .builder()
        .string("string")
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

**request:** `ObjectWithRequiredField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.object.getAndReturnWithMapOfMap(request) -> ObjectWithMapOfMap</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpoints().object().getAndReturnWithMapOfMap(
    ObjectWithMapOfMap
        .builder()
        .map(
            new HashMap<String, Map<String, String>>() {{
                put("map", new HashMap<String, String>() {{
                    put("map", "map");
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

**request:** `ObjectWithMapOfMap` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.object.getAndReturnNestedWithOptionalField(request) -> NestedObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpoints().object().getAndReturnNestedWithOptionalField(
    NestedObjectWithOptionalField
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

**request:** `NestedObjectWithOptionalField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.object.getAndReturnNestedWithRequiredField(string, request) -> NestedObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpoints().object().getAndReturnNestedWithRequiredField(
    "string",
    NestedObjectWithRequiredField
        .builder()
        .string("string")
        .nestedObject(
            ObjectWithOptionalField
                .builder()
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

**string:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `NestedObjectWithRequiredField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.object.getAndReturnNestedWithRequiredFieldAsList(request) -> NestedObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpoints().object().getAndReturnNestedWithRequiredFieldAsList(
    Arrays.asList(
        NestedObjectWithRequiredField
            .builder()
            .string("string")
            .nestedObject(
                ObjectWithOptionalField
                    .builder()
                    .build()
            )
            .build(),
        NestedObjectWithRequiredField
            .builder()
            .string("string")
            .nestedObject(
                ObjectWithOptionalField
                    .builder()
                    .build()
            )
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

**request:** `List<NestedObjectWithRequiredField>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Params
<details><summary><code>client.endpoints.params.getWithPath(param) -> String</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with path param
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
client.endpoints().params().getWithPath("param");
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

**param:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.params.getWithInlinePath(param) -> String</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with path param
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
client.endpoints().params().getWithPath("param");
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

**param:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.params.getWithQuery()</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with query param
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
client.endpoints().params().getWithQuery(
    GetWithQuery
        .builder()
        .query("query")
        .number(1)
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

**query:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**number:** `Integer` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.params.getWithAllowMultipleQuery()</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with multiple of same query param
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
client.endpoints().params().getWithQuery(
    GetWithQuery
        .builder()
        .query("query")
        .number(1)
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

**query:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**number:** `Integer` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.params.getWithPathAndQuery(param)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with path and query params
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
client.endpoints().params().getWithPathAndQuery(
    "param",
    GetWithPathAndQuery
        .builder()
        .query("query")
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

**param:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**query:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.params.getWithInlinePathAndQuery(param)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with path and query params
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
client.endpoints().params().getWithPathAndQuery(
    "param",
    GetWithPathAndQuery
        .builder()
        .query("query")
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

**param:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**query:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.params.modifyWithPath(param, request) -> String</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

PUT to update with path param
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
client.endpoints().params().modifyWithPath("param", "string");
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

**param:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.params.modifyWithInlinePath(param, request) -> String</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

PUT to update with path param
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
client.endpoints().params().modifyWithPath("param", "string");
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

**param:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Primitive
<details><summary><code>client.endpoints.primitive.getAndReturnString(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpoints().primitive().getAndReturnString("string");
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

**request:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.primitive.getAndReturnInt(request) -> Integer</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpoints().primitive().getAndReturnInt(1);
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

**request:** `Integer` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.primitive.getAndReturnLong(request) -> Long</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpoints().primitive().getAndReturnLong(1000000L);
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

**request:** `Long` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.primitive.getAndReturnDouble(request) -> Double</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpoints().primitive().getAndReturnDouble(1.1);
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

**request:** `Double` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.primitive.getAndReturnBool(request) -> Boolean</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpoints().primitive().getAndReturnBool(true);
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

**request:** `Boolean` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.primitive.getAndReturnDatetime(request) -> OffsetDateTime</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpoints().primitive().getAndReturnDatetime(OffsetDateTime.parse("2024-01-15T09:30:00Z"));
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

**request:** `OffsetDateTime` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.primitive.getAndReturnDate(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpoints().primitive().getAndReturnDate("2023-01-15");
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

**request:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.primitive.getAndReturnUuid(request) -> UUID</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpoints().primitive().getAndReturnUuid(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"));
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

**request:** `UUID` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.primitive.getAndReturnBase64(request) -> byte[]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpoints().primitive().getAndReturnBase64("SGVsbG8gd29ybGQh".getBytes());
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

**request:** `byte[]` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Put
<details><summary><code>client.endpoints.put.add(id) -> PutResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpoints().put().add(
    "id",
    PutRequest
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

**id:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Union
<details><summary><code>client.endpoints.union.getAndReturnUnion(request) -> Animal</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpoints().union().getAndReturnUnion(
    Animal.dog(
        Dog
            .builder()
            .name("name")
            .likesToWoof(true)
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

**request:** `Animal` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Urls
<details><summary><code>client.endpoints.urls.withMixedCase() -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpoints().urls().withMixedCase();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.urls.noEndingSlash() -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpoints().urls().noEndingSlash();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.urls.withEndingSlash() -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpoints().urls().withEndingSlash();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.urls.withUnderscores() -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpoints().urls().withUnderscores();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## InlinedRequests
<details><summary><code>client.inlinedRequests.postWithObjectBodyandResponse(request) -> ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

POST with custom object in request body, response is an object
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
client.inlinedRequests().postWithObjectBodyandResponse(
    PostWithObjectBody
        .builder()
        .string("string")
        .integer(1)
        .nestedObject(
            ObjectWithOptionalField
                .builder()
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

**string:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**integer:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**nestedObject:** `ObjectWithOptionalField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## NoAuth
<details><summary><code>client.noAuth.postWithNoAuth(request) -> Boolean</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

POST request with no auth
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
client.noAuth().postWithNoAuth(new 
HashMap<String, Object>() {{put("key", "value");
}});
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

**request:** `Object` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## NoReqBody
<details><summary><code>client.noReqBody.getWithNoRequestBody() -> ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.noReqBody().getWithNoRequestBody();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.noReqBody.postWithNoRequestBody() -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.noReqBody().postWithNoRequestBody();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## ReqWithHeaders
<details><summary><code>client.reqWithHeaders.getWithCustomHeader(request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.reqWithHeaders().getWithCustomHeader(
    ReqWithHeaders
        .builder()
        .xTestServiceHeader("X-TEST-SERVICE-HEADER")
        .xTestEndpointHeader("X-TEST-ENDPOINT-HEADER")
        .body("string")
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

**xTestEndpointHeader:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
