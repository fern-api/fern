# Reference
## EndpointsContainer
<details><summary><code>client.endpointsContainer.endpointsContainerGetAndReturnListOfPrimitives(request) -> List&amp;lt;String&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpointsContainer().endpointsContainerGetAndReturnListOfPrimitives(
    Arrays.asList("string")
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

<details><summary><code>client.endpointsContainer.endpointsContainerGetAndReturnListOfObjects(request) -> List&amp;lt;TypesObjectWithRequiredField&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpointsContainer().endpointsContainerGetAndReturnListOfObjects(
    Arrays.asList(
        TypesObjectWithRequiredField
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

**request:** `List<TypesObjectWithRequiredField>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpointsContainer.endpointsContainerGetAndReturnSetOfPrimitives(request) -> List&amp;lt;String&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpointsContainer().endpointsContainerGetAndReturnSetOfPrimitives(
    Arrays.asList("string")
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

<details><summary><code>client.endpointsContainer.endpointsContainerGetAndReturnSetOfObjects(request) -> List&amp;lt;TypesObjectWithRequiredField&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpointsContainer().endpointsContainerGetAndReturnSetOfObjects(
    Arrays.asList(
        TypesObjectWithRequiredField
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

**request:** `List<TypesObjectWithRequiredField>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpointsContainer.endpointsContainerGetAndReturnMapPrimToPrim(request) -> Map&amp;lt;String, String&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpointsContainer().endpointsContainerGetAndReturnMapPrimToPrim(
    new HashMap<String, String>() {{
        put("key", "value");
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

<details><summary><code>client.endpointsContainer.endpointsContainerGetAndReturnMapOfPrimToObject(request) -> Map&amp;lt;String, TypesObjectWithRequiredField&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpointsContainer().endpointsContainerGetAndReturnMapOfPrimToObject(
    new HashMap<String, TypesObjectWithRequiredField>() {{
        put("key", TypesObjectWithRequiredField
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

**request:** `Map<String, TypesObjectWithRequiredField>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpointsContainer.endpointsContainerGetAndReturnMapOfPrimToUndiscriminatedUnion(request) -> Map&amp;lt;String, TypesMixedType&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpointsContainer().endpointsContainerGetAndReturnMapOfPrimToUndiscriminatedUnion(
    new HashMap<String, TypesMixedType>() {{
        put("key", TypesMixedType.of(1.1));
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

**request:** `Map<String, TypesMixedType>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpointsContainer.endpointsContainerGetAndReturnOptional(request) -> TypesObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpointsContainer().endpointsContainerGetAndReturnOptional(
    TypesObjectWithRequiredField
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

**request:** `TypesObjectWithRequiredField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## EndpointsContentType
<details><summary><code>client.endpointsContentType.endpointsContentTypePostJsonPatchContentType(request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpointsContentType().endpointsContentTypePostJsonPatchContentType(
    TypesObjectWithOptionalField
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

**request:** `TypesObjectWithOptionalField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpointsContentType.endpointsContentTypePostJsonPatchContentWithCharsetType(request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpointsContentType().endpointsContentTypePostJsonPatchContentWithCharsetType(
    TypesObjectWithOptionalField
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

**request:** `TypesObjectWithOptionalField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## EndpointsEnum
<details><summary><code>client.endpointsEnum.endpointsEnumGetAndReturnEnum(request) -> TypesWeatherReport</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpointsEnum().endpointsEnumGetAndReturnEnum(TypesWeatherReport.SUNNY);
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

**request:** `TypesWeatherReport` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## EndpointsHttpMethods
<details><summary><code>client.endpointsHttpMethods.endpointsHttpMethodsTestGet(id) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpointsHttpMethods().endpointsHttpMethodsTestGet(
    "id",
    EndpointsHttpMethodsTestGetRequest
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

<details><summary><code>client.endpointsHttpMethods.endpointsHttpMethodsTestPut(id, request) -> TypesObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpointsHttpMethods().endpointsHttpMethodsTestPut(
    "id",
    EndpointsHttpMethodsTestPutRequest
        .builder()
        .body(
            TypesObjectWithRequiredField
                .builder()
                .string("string")
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

**id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `TypesObjectWithRequiredField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpointsHttpMethods.endpointsHttpMethodsTestDelete(id) -> Boolean</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpointsHttpMethods().endpointsHttpMethodsTestDelete(
    "id",
    EndpointsHttpMethodsTestDeleteRequest
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

<details><summary><code>client.endpointsHttpMethods.endpointsHttpMethodsTestPatch(id, request) -> TypesObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpointsHttpMethods().endpointsHttpMethodsTestPatch(
    "id",
    EndpointsHttpMethodsTestPatchRequest
        .builder()
        .body(
            TypesObjectWithOptionalField
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

**id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `TypesObjectWithOptionalField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpointsHttpMethods.endpointsHttpMethodsTestPost(request) -> TypesObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpointsHttpMethods().endpointsHttpMethodsTestPost(
    TypesObjectWithRequiredField
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

**request:** `TypesObjectWithRequiredField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## EndpointsObject
<details><summary><code>client.endpointsObject.endpointsObjectGetAndReturnWithOptionalField(request) -> TypesObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpointsObject().endpointsObjectGetAndReturnWithOptionalField(
    TypesObjectWithOptionalField
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

**request:** `TypesObjectWithOptionalField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpointsObject.endpointsObjectGetAndReturnWithRequiredField(request) -> TypesObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpointsObject().endpointsObjectGetAndReturnWithRequiredField(
    TypesObjectWithRequiredField
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

**request:** `TypesObjectWithRequiredField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpointsObject.endpointsObjectGetAndReturnWithMapOfMap(request) -> TypesObjectWithMapOfMap</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpointsObject().endpointsObjectGetAndReturnWithMapOfMap(
    TypesObjectWithMapOfMap
        .builder()
        .map(
            new HashMap<String, Map<String, String>>() {{
                put("key", new HashMap<String, String>() {{
                    put("key", "value");
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

**request:** `TypesObjectWithMapOfMap` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpointsObject.endpointsObjectGetAndReturnNestedWithOptionalField(request) -> TypesNestedObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpointsObject().endpointsObjectGetAndReturnNestedWithOptionalField(
    TypesNestedObjectWithOptionalField
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

**request:** `TypesNestedObjectWithOptionalField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpointsObject.endpointsObjectGetAndReturnNestedWithRequiredField(string, request) -> TypesNestedObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpointsObject().endpointsObjectGetAndReturnNestedWithRequiredField(
    "string",
    EndpointsObjectGetAndReturnNestedWithRequiredFieldRequest
        .builder()
        .body(
            TypesNestedObjectWithRequiredField
                .builder()
                .string("string")
                .nestedObject(
                    TypesObjectWithOptionalField
                        .builder()
                        .build()
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

**string:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `TypesNestedObjectWithRequiredField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpointsObject.endpointsObjectGetAndReturnNestedWithRequiredFieldAsList(request) -> TypesNestedObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpointsObject().endpointsObjectGetAndReturnNestedWithRequiredFieldAsList(
    Arrays.asList(
        TypesNestedObjectWithRequiredField
            .builder()
            .string("string")
            .nestedObject(
                TypesObjectWithOptionalField
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

**request:** `List<TypesNestedObjectWithRequiredField>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpointsObject.endpointsObjectGetAndReturnWithUnknownField(request) -> TypesObjectWithUnknownField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpointsObject().endpointsObjectGetAndReturnWithUnknownField(
    TypesObjectWithUnknownField
        .builder()
        .unknown(new 
            HashMap<String, Object>() {{put("key", "value");
            }})
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

**request:** `TypesObjectWithUnknownField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpointsObject.endpointsObjectGetAndReturnWithDocumentedUnknownType(request) -> TypesObjectWithDocumentedUnknownType</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpointsObject().endpointsObjectGetAndReturnWithDocumentedUnknownType(
    TypesObjectWithDocumentedUnknownType
        .builder()
        .documentedUnknownType(
            TypesDocumentedUnknownType.of(new 
            HashMap<String, Object>() {{put("key", "value");
            }})
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

**request:** `TypesObjectWithDocumentedUnknownType` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpointsObject.endpointsObjectGetAndReturnMapOfDocumentedUnknownType(request) -> Map&amp;lt;String, Object&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpointsObject().endpointsObjectGetAndReturnMapOfDocumentedUnknownType(
    new HashMap<String, Object>()
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

**request:** `Map<String, Object>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpointsObject.endpointsObjectGetAndReturnWithMixedRequiredAndOptionalFields(request) -> TypesObjectWithMixedRequiredAndOptionalFields</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Tests that dynamic snippets include all required properties in the
object initializer, even when the example omits some required fields.
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
client.endpointsObject().endpointsObjectGetAndReturnWithMixedRequiredAndOptionalFields(
    TypesObjectWithMixedRequiredAndOptionalFields
        .builder()
        .requiredString("requiredString")
        .requiredInteger(1)
        .requiredLong(1000000L)
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

**request:** `TypesObjectWithMixedRequiredAndOptionalFields` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpointsObject.endpointsObjectGetAndReturnWithRequiredNestedObject(request) -> TypesObjectWithRequiredNestedObject</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Tests that dynamic snippets recursively construct default objects for
required properties whose type is a named object. When the example
omits the nested object, the generator should construct a default
initializer with the nested object's required properties filled in.
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
client.endpointsObject().endpointsObjectGetAndReturnWithRequiredNestedObject(
    TypesObjectWithRequiredNestedObject
        .builder()
        .requiredString("requiredString")
        .requiredObject(
            TypesNestedObjectWithRequiredField
                .builder()
                .string("string")
                .nestedObject(
                    TypesObjectWithOptionalField
                        .builder()
                        .build()
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

**request:** `TypesObjectWithRequiredNestedObject` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpointsObject.endpointsObjectGetAndReturnWithDatetimeLikeString(request) -> TypesObjectWithDatetimeLikeString</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Tests that string fields containing datetime-like values are NOT reformatted.
The datetimeLikeString field should preserve its exact value "2023-08-31T14:15:22Z"
without being converted to "2023-08-31T14:15:22.000Z".
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
client.endpointsObject().endpointsObjectGetAndReturnWithDatetimeLikeString(
    TypesObjectWithDatetimeLikeString
        .builder()
        .datetimeLikeString("datetimeLikeString")
        .actualDatetime(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
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

**request:** `TypesObjectWithDatetimeLikeString` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## EndpointsPagination
<details><summary><code>client.endpointsPagination.endpointsPaginationListItems() -> EndpointsPaginatedResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List items with cursor pagination
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
client.endpointsPagination().endpointsPaginationListItems(
    EndpointsPaginationListItemsRequest
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

**cursor:** `Optional<String>` — The cursor for pagination
    
</dd>
</dl>

<dl>
<dd>

**limit:** `Optional<Integer>` — Maximum number of items to return
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## EndpointsParams
<details><summary><code>client.endpointsParams.endpointsParamsGetWithPath(param) -> String</code></summary>
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
client.endpointsParams().endpointsParamsGetWithPath(
    "param",
    EndpointsParamsGetWithPathRequest
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

**param:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpointsParams.endpointsParamsModifyWithPath(param, request) -> String</code></summary>
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
client.endpointsParams().endpointsParamsModifyWithPath(
    "param",
    EndpointsParamsModifyWithPathRequest
        .builder()
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

<details><summary><code>client.endpointsParams.endpointsParamsGetWithInlinePath(param) -> String</code></summary>
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
client.endpointsParams().endpointsParamsGetWithInlinePath(
    "param",
    EndpointsParamsGetWithInlinePathRequest
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

**param:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpointsParams.endpointsParamsModifyWithInlinePath(param, request) -> String</code></summary>
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
client.endpointsParams().endpointsParamsModifyWithInlinePath(
    "param",
    EndpointsParamsModifyWithInlinePathRequest
        .builder()
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

<details><summary><code>client.endpointsParams.endpointsParamsGetWithQuery()</code></summary>
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
client.endpointsParams().endpointsParamsGetWithQuery(
    EndpointsParamsGetWithQueryRequest
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

<details><summary><code>client.endpointsParams.endpointsParamsGetWithAllowMultipleQuery()</code></summary>
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
client.endpointsParams().endpointsParamsGetWithAllowMultipleQuery(
    EndpointsParamsGetWithAllowMultipleQueryRequest
        .builder()
        .query(
            Arrays.asList("query")
        )
        .number(
            Arrays.asList(1)
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

**query:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**number:** `Optional<Integer>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpointsParams.endpointsParamsGetWithPathAndQuery(param)</code></summary>
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
client.endpointsParams().endpointsParamsGetWithPathAndQuery(
    "param",
    EndpointsParamsGetWithPathAndQueryRequest
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

<details><summary><code>client.endpointsParams.endpointsParamsGetWithInlinePathAndQuery(param)</code></summary>
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
client.endpointsParams().endpointsParamsGetWithInlinePathAndQuery(
    "param",
    EndpointsParamsGetWithInlinePathAndQueryRequest
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

<details><summary><code>client.endpointsParams.endpointsParamsGetWithBooleanPath(param) -> String</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with boolean path param
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
client.endpointsParams().endpointsParamsGetWithBooleanPath(
    true,
    EndpointsParamsGetWithBooleanPathRequest
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

**param:** `Boolean` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpointsParams.endpointsParamsGetWithPathAndErrors(param) -> String</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with path param that can throw errors
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
client.endpointsParams().endpointsParamsGetWithPathAndErrors(
    "param",
    EndpointsParamsGetWithPathAndErrorsRequest
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

**param:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## EndpointsPrimitive
<details><summary><code>client.endpointsPrimitive.endpointsPrimitiveGetAndReturnString(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpointsPrimitive().endpointsPrimitiveGetAndReturnString("string");
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

<details><summary><code>client.endpointsPrimitive.endpointsPrimitiveGetAndReturnInt(request) -> Integer</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpointsPrimitive().endpointsPrimitiveGetAndReturnInt(1);
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

<details><summary><code>client.endpointsPrimitive.endpointsPrimitiveGetAndReturnLong(request) -> Long</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpointsPrimitive().endpointsPrimitiveGetAndReturnLong(1000000L);
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

<details><summary><code>client.endpointsPrimitive.endpointsPrimitiveGetAndReturnDouble(request) -> Double</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpointsPrimitive().endpointsPrimitiveGetAndReturnDouble(1.1);
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

<details><summary><code>client.endpointsPrimitive.endpointsPrimitiveGetAndReturnBool(request) -> Boolean</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpointsPrimitive().endpointsPrimitiveGetAndReturnBool(true);
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

<details><summary><code>client.endpointsPrimitive.endpointsPrimitiveGetAndReturnDatetime(request) -> OffsetDateTime</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpointsPrimitive().endpointsPrimitiveGetAndReturnDatetime(OffsetDateTime.parse("2024-01-15T09:30:00Z"));
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

<details><summary><code>client.endpointsPrimitive.endpointsPrimitiveGetAndReturnDate(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpointsPrimitive().endpointsPrimitiveGetAndReturnDate("2023-01-15");
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

<details><summary><code>client.endpointsPrimitive.endpointsPrimitiveGetAndReturnUuid(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpointsPrimitive().endpointsPrimitiveGetAndReturnUuid("string");
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

<details><summary><code>client.endpointsPrimitive.endpointsPrimitiveGetAndReturnBase64(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpointsPrimitive().endpointsPrimitiveGetAndReturnBase64("string");
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

## EndpointsPut
<details><summary><code>client.endpointsPut.endpointsPutAdd(id) -> EndpointsPutResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpointsPut().endpointsPutAdd(
    "id",
    EndpointsPutAddRequest
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

## EndpointsUnion
<details><summary><code>client.endpointsUnion.endpointsUnionGetAndReturnUnion(request) -> TypesAnimal</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpointsUnion().endpointsUnionGetAndReturnUnion(
    TypesAnimal.of(
        TypesAnimalZero
            .builder()
            .name("name")
            .likesToWoof(true)
            .animal(TypesAnimalZeroAnimal.DOG)
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

**request:** `TypesAnimal` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## EndpointsUrLs
<details><summary><code>client.endpointsUrLs.endpointsUrlsWithMixedCase() -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpointsUrLs().endpointsUrlsWithMixedCase();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpointsUrLs.endpointsUrlsNoEndingSlash() -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpointsUrLs().endpointsUrlsNoEndingSlash();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpointsUrLs.endpointsUrlsWithEndingSlash() -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpointsUrLs().endpointsUrlsWithEndingSlash();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpointsUrLs.endpointsUrlsWithUnderscores() -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.endpointsUrLs().endpointsUrlsWithUnderscores();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Inlinedrequests
<details><summary><code>client.inlinedrequests.postwithobjectbodyandresponse(request) -> TypesObjectWithOptionalField</code></summary>
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
client.inlinedrequests().postwithobjectbodyandresponse(
    InlinedRequestsPostWithObjectBodyandResponseRequest
        .builder()
        .string("string")
        .integer(1)
        .nestedObject(
            TypesObjectWithOptionalField
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

**nestedObject:** `TypesObjectWithOptionalField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Noauth
<details><summary><code>client.noauth.postwithnoauth(request) -> Boolean</code></summary>
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
client.noauth().postwithnoauth(new 
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

## Noreqbody
<details><summary><code>client.noreqbody.getwithnorequestbody() -> TypesObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.noreqbody().getwithnorequestbody();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.noreqbody.postwithnorequestbody() -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.noreqbody().postwithnorequestbody();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Reqwithheaders
<details><summary><code>client.reqwithheaders.getwithcustomheader(request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.reqwithheaders().getwithcustomheader(
    ReqWithHeadersGetWithCustomHeaderRequest
        .builder()
        .testEndpointHeader("X-TEST-ENDPOINT-HEADER")
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

**testEndpointHeader:** `String` 
    
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

