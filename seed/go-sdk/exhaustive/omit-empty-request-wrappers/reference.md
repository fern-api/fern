# Reference
## EndpointsContainer
<details><summary><code>client.EndpointsContainer.EndpointsContainerGetAndReturnListOfPrimitives(request) -> []string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := []string{
        "string",
    }
client.EndpointsContainer.EndpointsContainerGetAndReturnListOfPrimitives(
        context.TODO(),
        request,
    )
}
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

**request:** `[]string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsContainer.EndpointsContainerGetAndReturnListOfObjects(request) -> []*fern.TypesObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := []*fern.TypesObjectWithRequiredField{
        &fern.TypesObjectWithRequiredField{
            FieldString: "string",
        },
    }
client.EndpointsContainer.EndpointsContainerGetAndReturnListOfObjects(
        context.TODO(),
        request,
    )
}
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

**request:** `[]*fern.TypesObjectWithRequiredField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsContainer.EndpointsContainerGetAndReturnSetOfPrimitives(request) -> []string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := []string{
        "string",
    }
client.EndpointsContainer.EndpointsContainerGetAndReturnSetOfPrimitives(
        context.TODO(),
        request,
    )
}
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

**request:** `[]string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsContainer.EndpointsContainerGetAndReturnSetOfObjects(request) -> []*fern.TypesObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := []*fern.TypesObjectWithRequiredField{
        &fern.TypesObjectWithRequiredField{
            FieldString: "string",
        },
    }
client.EndpointsContainer.EndpointsContainerGetAndReturnSetOfObjects(
        context.TODO(),
        request,
    )
}
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

**request:** `[]*fern.TypesObjectWithRequiredField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsContainer.EndpointsContainerGetAndReturnMapPrimToPrim(request) -> map[string]string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := map[string]string{
        "key": "value",
    }
client.EndpointsContainer.EndpointsContainerGetAndReturnMapPrimToPrim(
        context.TODO(),
        request,
    )
}
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

**request:** `map[string]string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsContainer.EndpointsContainerGetAndReturnMapOfPrimToObject(request) -> map[string]*fern.TypesObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := map[string]*fern.TypesObjectWithRequiredField{
        "key": &fern.TypesObjectWithRequiredField{
            FieldString: "string",
        },
    }
client.EndpointsContainer.EndpointsContainerGetAndReturnMapOfPrimToObject(
        context.TODO(),
        request,
    )
}
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

**request:** `map[string]*fern.TypesObjectWithRequiredField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsContainer.EndpointsContainerGetAndReturnMapOfPrimToUndiscriminatedUnion(request) -> map[string]*fern.TypesMixedType</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := map[string]*fern.TypesMixedType{
        "key": &fern.TypesMixedType{
            Double: 1.1,
        },
    }
client.EndpointsContainer.EndpointsContainerGetAndReturnMapOfPrimToUndiscriminatedUnion(
        context.TODO(),
        request,
    )
}
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

**request:** `map[string]*fern.TypesMixedType` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsContainer.EndpointsContainerGetAndReturnOptional(request) -> *fern.TypesObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.TypesObjectWithRequiredField{
        FieldString: "string",
    }
client.EndpointsContainer.EndpointsContainerGetAndReturnOptional(
        context.TODO(),
        request,
    )
}
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

**request:** `*fern.TypesObjectWithRequiredField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## EndpointsContentType
<details><summary><code>client.EndpointsContentType.EndpointsContentTypePostJSONPatchContentType(request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.TypesObjectWithOptionalField{}
client.EndpointsContentType.EndpointsContentTypePostJSONPatchContentType(
        context.TODO(),
        request,
    )
}
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

**request:** `*fern.TypesObjectWithOptionalField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsContentType.EndpointsContentTypePostJSONPatchContentWithCharsetType(request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.TypesObjectWithOptionalField{}
client.EndpointsContentType.EndpointsContentTypePostJSONPatchContentWithCharsetType(
        context.TODO(),
        request,
    )
}
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

**request:** `*fern.TypesObjectWithOptionalField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## EndpointsEnum
<details><summary><code>client.EndpointsEnum.EndpointsEnumGetAndReturnEnum(request) -> *fern.TypesWeatherReport</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.EndpointsEnum.EndpointsEnumGetAndReturnEnum(
        context.TODO(),
        request,
    )
}
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

**request:** `*fern.TypesWeatherReport` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## EndpointsHTTPMethods
<details><summary><code>client.EndpointsHTTPMethods.EndpointsHTTPMethodsTestGet(ID) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.EndpointsHTTPMethodsTestGetRequest{
        ID: "id",
    }
client.EndpointsHTTPMethods.EndpointsHTTPMethodsTestGet(
        context.TODO(),
        request,
    )
}
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

**id:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsHTTPMethods.EndpointsHTTPMethodsTestPut(ID, request) -> *fern.TypesObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.EndpointsHTTPMethodsTestPutRequest{
        ID: "id",
        Body: &fern.TypesObjectWithRequiredField{
            FieldString: "string",
        },
    }
client.EndpointsHTTPMethods.EndpointsHTTPMethodsTestPut(
        context.TODO(),
        request,
    )
}
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

**id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `*fern.TypesObjectWithRequiredField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsHTTPMethods.EndpointsHTTPMethodsTestDelete(ID) -> bool</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.EndpointsHTTPMethodsTestDeleteRequest{
        ID: "id",
    }
client.EndpointsHTTPMethods.EndpointsHTTPMethodsTestDelete(
        context.TODO(),
        request,
    )
}
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

**id:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsHTTPMethods.EndpointsHTTPMethodsTestPatch(ID, request) -> *fern.TypesObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.EndpointsHTTPMethodsTestPatchRequest{
        ID: "id",
        Body: &fern.TypesObjectWithOptionalField{},
    }
client.EndpointsHTTPMethods.EndpointsHTTPMethodsTestPatch(
        context.TODO(),
        request,
    )
}
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

**id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `*fern.TypesObjectWithOptionalField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsHTTPMethods.EndpointsHTTPMethodsTestPost(request) -> *fern.TypesObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.TypesObjectWithRequiredField{
        FieldString: "string",
    }
client.EndpointsHTTPMethods.EndpointsHTTPMethodsTestPost(
        context.TODO(),
        request,
    )
}
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

**request:** `*fern.TypesObjectWithRequiredField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## EndpointsObject
<details><summary><code>client.EndpointsObject.EndpointsObjectGetAndReturnWithOptionalField(request) -> *fern.TypesObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.TypesObjectWithOptionalField{}
client.EndpointsObject.EndpointsObjectGetAndReturnWithOptionalField(
        context.TODO(),
        request,
    )
}
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

**request:** `*fern.TypesObjectWithOptionalField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsObject.EndpointsObjectGetAndReturnWithRequiredField(request) -> *fern.TypesObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.TypesObjectWithRequiredField{
        FieldString: "string",
    }
client.EndpointsObject.EndpointsObjectGetAndReturnWithRequiredField(
        context.TODO(),
        request,
    )
}
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

**request:** `*fern.TypesObjectWithRequiredField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsObject.EndpointsObjectGetAndReturnWithMapOfMap(request) -> *fern.TypesObjectWithMapOfMap</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.TypesObjectWithMapOfMap{
        Map: map[string]map[string]string{
            "key": map[string]string{
                "key": "value",
            },
        },
    }
client.EndpointsObject.EndpointsObjectGetAndReturnWithMapOfMap(
        context.TODO(),
        request,
    )
}
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

**request:** `*fern.TypesObjectWithMapOfMap` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsObject.EndpointsObjectGetAndReturnNestedWithOptionalField(request) -> *fern.TypesNestedObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.TypesNestedObjectWithOptionalField{}
client.EndpointsObject.EndpointsObjectGetAndReturnNestedWithOptionalField(
        context.TODO(),
        request,
    )
}
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

**request:** `*fern.TypesNestedObjectWithOptionalField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsObject.EndpointsObjectGetAndReturnNestedWithRequiredField(String, request) -> *fern.TypesNestedObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.EndpointsObjectGetAndReturnNestedWithRequiredFieldRequest{
        String: "string",
        Body: &fern.TypesNestedObjectWithRequiredField{
            FieldString: "string",
            NestedObject: &fern.TypesObjectWithOptionalField{},
        },
    }
client.EndpointsObject.EndpointsObjectGetAndReturnNestedWithRequiredField(
        context.TODO(),
        request,
    )
}
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

**string_:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `*fern.TypesNestedObjectWithRequiredField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsObject.EndpointsObjectGetAndReturnNestedWithRequiredFieldAsList(request) -> *fern.TypesNestedObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := []*fern.TypesNestedObjectWithRequiredField{
        &fern.TypesNestedObjectWithRequiredField{
            FieldString: "string",
            NestedObject: &fern.TypesObjectWithOptionalField{},
        },
    }
client.EndpointsObject.EndpointsObjectGetAndReturnNestedWithRequiredFieldAsList(
        context.TODO(),
        request,
    )
}
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

**request:** `[]*fern.TypesNestedObjectWithRequiredField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsObject.EndpointsObjectGetAndReturnWithUnknownField(request) -> *fern.TypesObjectWithUnknownField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.TypesObjectWithUnknownField{
        Unknown: map[string]any{
            "key": "value",
        },
    }
client.EndpointsObject.EndpointsObjectGetAndReturnWithUnknownField(
        context.TODO(),
        request,
    )
}
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

**request:** `*fern.TypesObjectWithUnknownField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsObject.EndpointsObjectGetAndReturnWithDocumentedUnknownType(request) -> *fern.TypesObjectWithDocumentedUnknownType</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.TypesObjectWithDocumentedUnknownType{
        DocumentedUnknownType: map[string]any{
            "key": "value",
        },
    }
client.EndpointsObject.EndpointsObjectGetAndReturnWithDocumentedUnknownType(
        context.TODO(),
        request,
    )
}
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

**request:** `*fern.TypesObjectWithDocumentedUnknownType` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsObject.EndpointsObjectGetAndReturnMapOfDocumentedUnknownType(request) -> fern.TypesMapOfDocumentedUnknownType</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := map[string]fern.TypesDocumentedUnknownType{}
client.EndpointsObject.EndpointsObjectGetAndReturnMapOfDocumentedUnknownType(
        context.TODO(),
        request,
    )
}
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

**request:** `fern.TypesMapOfDocumentedUnknownType` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsObject.EndpointsObjectGetAndReturnWithMixedRequiredAndOptionalFields(request) -> *fern.TypesObjectWithMixedRequiredAndOptionalFields</code></summary>
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

```go
request := &fern.TypesObjectWithMixedRequiredAndOptionalFields{
        RequiredString: "requiredString",
        RequiredInteger: 1,
        RequiredLong: int64(1000000),
    }
client.EndpointsObject.EndpointsObjectGetAndReturnWithMixedRequiredAndOptionalFields(
        context.TODO(),
        request,
    )
}
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

**request:** `*fern.TypesObjectWithMixedRequiredAndOptionalFields` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsObject.EndpointsObjectGetAndReturnWithRequiredNestedObject(request) -> *fern.TypesObjectWithRequiredNestedObject</code></summary>
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

```go
request := &fern.TypesObjectWithRequiredNestedObject{
        RequiredString: "requiredString",
        RequiredObject: &fern.TypesNestedObjectWithRequiredField{
            FieldString: "string",
            NestedObject: &fern.TypesObjectWithOptionalField{},
        },
    }
client.EndpointsObject.EndpointsObjectGetAndReturnWithRequiredNestedObject(
        context.TODO(),
        request,
    )
}
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

**request:** `*fern.TypesObjectWithRequiredNestedObject` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsObject.EndpointsObjectGetAndReturnWithDatetimeLikeString(request) -> *fern.TypesObjectWithDatetimeLikeString</code></summary>
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

```go
request := &fern.TypesObjectWithDatetimeLikeString{
        DatetimeLikeString: "datetimeLikeString",
        ActualDatetime: fern.MustParseDateTime(
            "2024-01-15T09:30:00Z",
        ),
    }
client.EndpointsObject.EndpointsObjectGetAndReturnWithDatetimeLikeString(
        context.TODO(),
        request,
    )
}
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

**request:** `*fern.TypesObjectWithDatetimeLikeString` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## EndpointsPagination
<details><summary><code>client.EndpointsPagination.EndpointsPaginationListItems() -> *fern.EndpointsPaginatedResponse</code></summary>
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

```go
request := &fern.EndpointsPaginationListItemsRequest{}
client.EndpointsPagination.EndpointsPaginationListItems(
        context.TODO(),
        request,
    )
}
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

**cursor:** `*string` — The cursor for pagination
    
</dd>
</dl>

<dl>
<dd>

**limit:** `*int` — Maximum number of items to return
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## EndpointsParams
<details><summary><code>client.EndpointsParams.EndpointsParamsGetWithPath(Param) -> string</code></summary>
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

```go
request := &fern.EndpointsParamsGetWithPathRequest{
        Param: "param",
    }
client.EndpointsParams.EndpointsParamsGetWithPath(
        context.TODO(),
        request,
    )
}
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

**param:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsParams.EndpointsParamsModifyWithPath(Param, request) -> string</code></summary>
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

```go
request := &fern.EndpointsParamsModifyWithPathRequest{
        Param: "param",
        Body: "string",
    }
client.EndpointsParams.EndpointsParamsModifyWithPath(
        context.TODO(),
        request,
    )
}
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

**param:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsParams.EndpointsParamsGetWithInlinePath(Param) -> string</code></summary>
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

```go
request := &fern.EndpointsParamsGetWithInlinePathRequest{
        Param: "param",
    }
client.EndpointsParams.EndpointsParamsGetWithInlinePath(
        context.TODO(),
        request,
    )
}
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

**param:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsParams.EndpointsParamsModifyWithInlinePath(Param, request) -> string</code></summary>
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

```go
request := &fern.EndpointsParamsModifyWithInlinePathRequest{
        Param: "param",
        Body: "string",
    }
client.EndpointsParams.EndpointsParamsModifyWithInlinePath(
        context.TODO(),
        request,
    )
}
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

**param:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsParams.EndpointsParamsGetWithQuery() -> error</code></summary>
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

```go
request := &fern.EndpointsParamsGetWithQueryRequest{
        Query: "query",
        Number: 1,
    }
client.EndpointsParams.EndpointsParamsGetWithQuery(
        context.TODO(),
        request,
    )
}
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

**query:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**number:** `int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsParams.EndpointsParamsGetWithAllowMultipleQuery() -> error</code></summary>
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

```go
request := &fern.EndpointsParamsGetWithAllowMultipleQueryRequest{
        Query: []*string{
            fern.String(
                "query",
            ),
        },
        Number: []*int{
            fern.Int(
                1,
            ),
        },
    }
client.EndpointsParams.EndpointsParamsGetWithAllowMultipleQuery(
        context.TODO(),
        request,
    )
}
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

**query:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**number:** `*int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsParams.EndpointsParamsGetWithPathAndQuery(Param) -> error</code></summary>
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

```go
request := &fern.EndpointsParamsGetWithPathAndQueryRequest{
        Param: "param",
        Query: "query",
    }
client.EndpointsParams.EndpointsParamsGetWithPathAndQuery(
        context.TODO(),
        request,
    )
}
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

**param:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**query:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsParams.EndpointsParamsGetWithInlinePathAndQuery(Param) -> error</code></summary>
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

```go
request := &fern.EndpointsParamsGetWithInlinePathAndQueryRequest{
        Param: "param",
        Query: "query",
    }
client.EndpointsParams.EndpointsParamsGetWithInlinePathAndQuery(
        context.TODO(),
        request,
    )
}
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

**param:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**query:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsParams.EndpointsParamsGetWithBooleanPath(Param) -> string</code></summary>
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

```go
request := &fern.EndpointsParamsGetWithBooleanPathRequest{
        Param: true,
    }
client.EndpointsParams.EndpointsParamsGetWithBooleanPath(
        context.TODO(),
        request,
    )
}
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

**param:** `bool` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsParams.EndpointsParamsGetWithPathAndErrors(Param) -> string</code></summary>
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

```go
request := &fern.EndpointsParamsGetWithPathAndErrorsRequest{
        Param: "param",
    }
client.EndpointsParams.EndpointsParamsGetWithPathAndErrors(
        context.TODO(),
        request,
    )
}
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

**param:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## EndpointsPrimitive
<details><summary><code>client.EndpointsPrimitive.EndpointsPrimitiveGetAndReturnString(request) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.EndpointsPrimitive.EndpointsPrimitiveGetAndReturnString(
        context.TODO(),
        request,
    )
}
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

**request:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsPrimitive.EndpointsPrimitiveGetAndReturnInt(request) -> int</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.EndpointsPrimitive.EndpointsPrimitiveGetAndReturnInt(
        context.TODO(),
        request,
    )
}
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

**request:** `int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsPrimitive.EndpointsPrimitiveGetAndReturnLong(request) -> int64</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.EndpointsPrimitive.EndpointsPrimitiveGetAndReturnLong(
        context.TODO(),
        request,
    )
}
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

**request:** `int64` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsPrimitive.EndpointsPrimitiveGetAndReturnDouble(request) -> float64</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.EndpointsPrimitive.EndpointsPrimitiveGetAndReturnDouble(
        context.TODO(),
        request,
    )
}
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

**request:** `float64` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsPrimitive.EndpointsPrimitiveGetAndReturnBool(request) -> bool</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.EndpointsPrimitive.EndpointsPrimitiveGetAndReturnBool(
        context.TODO(),
        request,
    )
}
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

**request:** `bool` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsPrimitive.EndpointsPrimitiveGetAndReturnDatetime(request) -> time.Time</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.EndpointsPrimitive.EndpointsPrimitiveGetAndReturnDatetime(
        context.TODO(),
        request,
    )
}
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

**request:** `time.Time` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsPrimitive.EndpointsPrimitiveGetAndReturnDate(request) -> time.Time</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.EndpointsPrimitive.EndpointsPrimitiveGetAndReturnDate(
        context.TODO(),
        request,
    )
}
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

**request:** `time.Time` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsPrimitive.EndpointsPrimitiveGetAndReturnUUID(request) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.EndpointsPrimitive.EndpointsPrimitiveGetAndReturnUUID(
        context.TODO(),
        request,
    )
}
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

**request:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsPrimitive.EndpointsPrimitiveGetAndReturnBase64(request) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.EndpointsPrimitive.EndpointsPrimitiveGetAndReturnBase64(
        context.TODO(),
        request,
    )
}
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

**request:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## EndpointsPut
<details><summary><code>client.EndpointsPut.EndpointsPutAdd(ID) -> *fern.EndpointsPutResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.EndpointsPutAddRequest{
        ID: "id",
    }
client.EndpointsPut.EndpointsPutAdd(
        context.TODO(),
        request,
    )
}
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

**id:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## EndpointsUnion
<details><summary><code>client.EndpointsUnion.EndpointsUnionGetAndReturnUnion(request) -> *fern.TypesAnimal</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.TypesAnimal{
        TypesAnimalZero: &fern.TypesAnimalZero{
            Name: "name",
            LikesToWoof: true,
            Animal: fern.TypesAnimalZeroAnimalDog,
        },
    }
client.EndpointsUnion.EndpointsUnionGetAndReturnUnion(
        context.TODO(),
        request,
    )
}
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

**request:** `*fern.TypesAnimal` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## EndpointsUrLs
<details><summary><code>client.EndpointsUrLs.EndpointsURLsWithMixedCase() -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.EndpointsUrLs.EndpointsURLsWithMixedCase(
        context.TODO(),
    )
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsUrLs.EndpointsURLsNoEndingSlash() -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.EndpointsUrLs.EndpointsURLsNoEndingSlash(
        context.TODO(),
    )
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsUrLs.EndpointsURLsWithEndingSlash() -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.EndpointsUrLs.EndpointsURLsWithEndingSlash(
        context.TODO(),
    )
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsUrLs.EndpointsURLsWithUnderscores() -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.EndpointsUrLs.EndpointsURLsWithUnderscores(
        context.TODO(),
    )
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Inlinedrequests
<details><summary><code>client.Inlinedrequests.Postwithobjectbodyandresponse(request) -> *fern.TypesObjectWithOptionalField</code></summary>
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

```go
request := &fern.InlinedRequestsPostWithObjectBodyandResponseRequest{
        FieldString: "string",
        Integer: 1,
        NestedObject: &fern.TypesObjectWithOptionalField{},
    }
client.Inlinedrequests.Postwithobjectbodyandresponse(
        context.TODO(),
        request,
    )
}
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

**string_:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**integer:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**nestedObject:** `*fern.TypesObjectWithOptionalField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Noauth
<details><summary><code>client.Noauth.Postwithnoauth(request) -> bool</code></summary>
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

```go
request := map[string]any{
        "key": "value",
    }
client.Noauth.Postwithnoauth(
        context.TODO(),
        request,
    )
}
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

**request:** `any` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Noreqbody
<details><summary><code>client.Noreqbody.Getwithnorequestbody() -> *fern.TypesObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Noreqbody.Getwithnorequestbody(
        context.TODO(),
    )
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Noreqbody.Postwithnorequestbody() -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Noreqbody.Postwithnorequestbody(
        context.TODO(),
    )
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Reqwithheaders
<details><summary><code>client.Reqwithheaders.Getwithcustomheader(request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.ReqWithHeadersGetWithCustomHeaderRequest{
        TestEndpointHeader: "X-TEST-ENDPOINT-HEADER",
        Body: "string",
    }
client.Reqwithheaders.Getwithcustomheader(
        context.TODO(),
        request,
    )
}
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

**testEndpointHeader:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

