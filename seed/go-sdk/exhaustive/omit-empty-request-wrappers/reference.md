# Reference
## Endpoints Container
<details><summary><code>client.Endpoints.Container.GetAndReturnListOfPrimitives(request) -> []string</code></summary>
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
        "string",
    }
client.Endpoints.Container.GetAndReturnListOfPrimitives(
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

<details><summary><code>client.Endpoints.Container.GetAndReturnListOfObjects(request) -> []*types.ObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := []*types.ObjectWithRequiredField{
        &types.ObjectWithRequiredField{
            FieldString: "string",
        },
        &types.ObjectWithRequiredField{
            FieldString: "string",
        },
    }
client.Endpoints.Container.GetAndReturnListOfObjects(
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

**request:** `[]*types.ObjectWithRequiredField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Container.GetAndReturnSetOfPrimitives(request) -> []string</code></summary>
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
client.Endpoints.Container.GetAndReturnSetOfPrimitives(
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

<details><summary><code>client.Endpoints.Container.GetAndReturnSetOfObjects(request) -> []*types.ObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := []*types.ObjectWithRequiredField{
        &types.ObjectWithRequiredField{
            FieldString: "string",
        },
    }
client.Endpoints.Container.GetAndReturnSetOfObjects(
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

**request:** `[]*types.ObjectWithRequiredField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Container.GetAndReturnMapPrimToPrim(request) -> map[string]string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := map[string]string{
        "string": "string",
    }
client.Endpoints.Container.GetAndReturnMapPrimToPrim(
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

<details><summary><code>client.Endpoints.Container.GetAndReturnMapOfPrimToObject(request) -> map[string]*types.ObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := map[string]*types.ObjectWithRequiredField{
        "string": &types.ObjectWithRequiredField{
            FieldString: "string",
        },
    }
client.Endpoints.Container.GetAndReturnMapOfPrimToObject(
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

**request:** `map[string]*types.ObjectWithRequiredField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Container.GetAndReturnMapOfPrimToUndiscriminatedUnion(request) -> map[string]*types.MixedType</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := map[string]*types.MixedType{
        "string": &types.MixedType{
            Double: 1.1,
        },
    }
client.Endpoints.Container.GetAndReturnMapOfPrimToUndiscriminatedUnion(
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

**request:** `map[string]*types.MixedType` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Container.GetAndReturnOptional(request) -> *types.ObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &types.ObjectWithRequiredField{
        FieldString: "string",
    }
client.Endpoints.Container.GetAndReturnOptional(
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

**request:** `*types.ObjectWithRequiredField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints ContentType
<details><summary><code>client.Endpoints.ContentType.PostJSONPatchContentType(request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &types.ObjectWithOptionalField{
        FieldString: fern.String(
            "string",
        ),
        Integer: fern.Int(
            1,
        ),
        Long: fern.Int64(
            int64(1000000),
        ),
        Double: fern.Float64(
            1.1,
        ),
        Bool: fern.Bool(
            true,
        ),
        Datetime: fern.Time(
            fern.MustParseDateTime(
                "2024-01-15T09:30:00Z",
            ),
        ),
        Date: fern.Time(
            fern.MustParseDate(
                "2023-01-15",
            ),
        ),
        UUID: fern.UUID(
            uuid.MustParse(
                "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            ),
        ),
        Base64: fern.Bytes(
            []byte("SGVsbG8gd29ybGQh"),
        ),
        List: []string{
            "list",
            "list",
        },
        Set: []string{
            "set",
        },
        Map: map[int]string{
            1: "map",
        },
        Bigint: fern.String(
            "1000000",
        ),
    }
client.Endpoints.ContentType.PostJSONPatchContentType(
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

**request:** `*types.ObjectWithOptionalField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.ContentType.PostJSONPatchContentWithCharsetType(request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &types.ObjectWithOptionalField{
        FieldString: fern.String(
            "string",
        ),
        Integer: fern.Int(
            1,
        ),
        Long: fern.Int64(
            int64(1000000),
        ),
        Double: fern.Float64(
            1.1,
        ),
        Bool: fern.Bool(
            true,
        ),
        Datetime: fern.Time(
            fern.MustParseDateTime(
                "2024-01-15T09:30:00Z",
            ),
        ),
        Date: fern.Time(
            fern.MustParseDate(
                "2023-01-15",
            ),
        ),
        UUID: fern.UUID(
            uuid.MustParse(
                "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            ),
        ),
        Base64: fern.Bytes(
            []byte("SGVsbG8gd29ybGQh"),
        ),
        List: []string{
            "list",
            "list",
        },
        Set: []string{
            "set",
        },
        Map: map[int]string{
            1: "map",
        },
        Bigint: fern.String(
            "1000000",
        ),
    }
client.Endpoints.ContentType.PostJSONPatchContentWithCharsetType(
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

**request:** `*types.ObjectWithOptionalField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Enum
<details><summary><code>client.Endpoints.Enum.GetAndReturnEnum(request) -> *types.WeatherReport</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Endpoints.Enum.GetAndReturnEnum(
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

**request:** `*types.WeatherReport` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints HTTPMethods
<details><summary><code>client.Endpoints.HTTPMethods.TestGet(ID) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Endpoints.HTTPMethods.TestGet(
        context.TODO(),
        "id",
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

<details><summary><code>client.Endpoints.HTTPMethods.TestPost(request) -> *types.ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &types.ObjectWithRequiredField{
        FieldString: "string",
    }
client.Endpoints.HTTPMethods.TestPost(
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

**request:** `*types.ObjectWithRequiredField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.HTTPMethods.TestPut(ID, request) -> *types.ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &types.ObjectWithRequiredField{
        FieldString: "string",
    }
client.Endpoints.HTTPMethods.TestPut(
        context.TODO(),
        "id",
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

**request:** `*types.ObjectWithRequiredField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.HTTPMethods.TestPatch(ID, request) -> *types.ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &types.ObjectWithOptionalField{
        FieldString: fern.String(
            "string",
        ),
        Integer: fern.Int(
            1,
        ),
        Long: fern.Int64(
            int64(1000000),
        ),
        Double: fern.Float64(
            1.1,
        ),
        Bool: fern.Bool(
            true,
        ),
        Datetime: fern.Time(
            fern.MustParseDateTime(
                "2024-01-15T09:30:00Z",
            ),
        ),
        Date: fern.Time(
            fern.MustParseDate(
                "2023-01-15",
            ),
        ),
        UUID: fern.UUID(
            uuid.MustParse(
                "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            ),
        ),
        Base64: fern.Bytes(
            []byte("SGVsbG8gd29ybGQh"),
        ),
        List: []string{
            "list",
            "list",
        },
        Set: []string{
            "set",
        },
        Map: map[int]string{
            1: "map",
        },
        Bigint: fern.String(
            "1000000",
        ),
    }
client.Endpoints.HTTPMethods.TestPatch(
        context.TODO(),
        "id",
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

**request:** `*types.ObjectWithOptionalField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.HTTPMethods.TestDelete(ID) -> bool</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Endpoints.HTTPMethods.TestDelete(
        context.TODO(),
        "id",
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

## Endpoints Object
<details><summary><code>client.Endpoints.Object.GetAndReturnWithOptionalField(request) -> *types.ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &types.ObjectWithOptionalField{
        FieldString: fern.String(
            "string",
        ),
        Integer: fern.Int(
            1,
        ),
        Long: fern.Int64(
            int64(1000000),
        ),
        Double: fern.Float64(
            1.1,
        ),
        Bool: fern.Bool(
            true,
        ),
        Datetime: fern.Time(
            fern.MustParseDateTime(
                "2024-01-15T09:30:00Z",
            ),
        ),
        Date: fern.Time(
            fern.MustParseDate(
                "2023-01-15",
            ),
        ),
        UUID: fern.UUID(
            uuid.MustParse(
                "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            ),
        ),
        Base64: fern.Bytes(
            []byte("SGVsbG8gd29ybGQh"),
        ),
        List: []string{
            "list",
            "list",
        },
        Set: []string{
            "set",
        },
        Map: map[int]string{
            1: "map",
        },
        Bigint: fern.String(
            "1000000",
        ),
    }
client.Endpoints.Object.GetAndReturnWithOptionalField(
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

**request:** `*types.ObjectWithOptionalField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Object.GetAndReturnWithRequiredField(request) -> *types.ObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &types.ObjectWithRequiredField{
        FieldString: "string",
    }
client.Endpoints.Object.GetAndReturnWithRequiredField(
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

**request:** `*types.ObjectWithRequiredField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Object.GetAndReturnWithMapOfMap(request) -> *types.ObjectWithMapOfMap</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &types.ObjectWithMapOfMap{
        Map: map[string]map[string]string{
            "map": map[string]string{
                "map": "map",
            },
        },
    }
client.Endpoints.Object.GetAndReturnWithMapOfMap(
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

**request:** `*types.ObjectWithMapOfMap` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Object.GetAndReturnNestedWithOptionalField(request) -> *types.NestedObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &types.NestedObjectWithOptionalField{
        FieldString: fern.String(
            "string",
        ),
        NestedObject: &types.ObjectWithOptionalField{
            FieldString: fern.String(
                "string",
            ),
            Integer: fern.Int(
                1,
            ),
            Long: fern.Int64(
                int64(1000000),
            ),
            Double: fern.Float64(
                1.1,
            ),
            Bool: fern.Bool(
                true,
            ),
            Datetime: fern.Time(
                fern.MustParseDateTime(
                    "2024-01-15T09:30:00Z",
                ),
            ),
            Date: fern.Time(
                fern.MustParseDate(
                    "2023-01-15",
                ),
            ),
            UUID: fern.UUID(
                uuid.MustParse(
                    "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                ),
            ),
            Base64: fern.Bytes(
                []byte("SGVsbG8gd29ybGQh"),
            ),
            List: []string{
                "list",
                "list",
            },
            Set: []string{
                "set",
            },
            Map: map[int]string{
                1: "map",
            },
            Bigint: fern.String(
                "1000000",
            ),
        },
    }
client.Endpoints.Object.GetAndReturnNestedWithOptionalField(
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

**request:** `*types.NestedObjectWithOptionalField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Object.GetAndReturnNestedWithRequiredField(String, request) -> *types.NestedObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &types.NestedObjectWithRequiredField{
        FieldString: "string",
        NestedObject: &types.ObjectWithOptionalField{
            FieldString: fern.String(
                "string",
            ),
            Integer: fern.Int(
                1,
            ),
            Long: fern.Int64(
                int64(1000000),
            ),
            Double: fern.Float64(
                1.1,
            ),
            Bool: fern.Bool(
                true,
            ),
            Datetime: fern.Time(
                fern.MustParseDateTime(
                    "2024-01-15T09:30:00Z",
                ),
            ),
            Date: fern.Time(
                fern.MustParseDate(
                    "2023-01-15",
                ),
            ),
            UUID: fern.UUID(
                uuid.MustParse(
                    "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                ),
            ),
            Base64: fern.Bytes(
                []byte("SGVsbG8gd29ybGQh"),
            ),
            List: []string{
                "list",
                "list",
            },
            Set: []string{
                "set",
            },
            Map: map[int]string{
                1: "map",
            },
            Bigint: fern.String(
                "1000000",
            ),
        },
    }
client.Endpoints.Object.GetAndReturnNestedWithRequiredField(
        context.TODO(),
        "string",
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

**request:** `*types.NestedObjectWithRequiredField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Object.GetAndReturnNestedWithRequiredFieldAsList(request) -> *types.NestedObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := []*types.NestedObjectWithRequiredField{
        &types.NestedObjectWithRequiredField{
            FieldString: "string",
            NestedObject: &types.ObjectWithOptionalField{
                FieldString: fern.String(
                    "string",
                ),
                Integer: fern.Int(
                    1,
                ),
                Long: fern.Int64(
                    int64(1000000),
                ),
                Double: fern.Float64(
                    1.1,
                ),
                Bool: fern.Bool(
                    true,
                ),
                Datetime: fern.Time(
                    fern.MustParseDateTime(
                        "2024-01-15T09:30:00Z",
                    ),
                ),
                Date: fern.Time(
                    fern.MustParseDate(
                        "2023-01-15",
                    ),
                ),
                UUID: fern.UUID(
                    uuid.MustParse(
                        "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                    ),
                ),
                Base64: fern.Bytes(
                    []byte("SGVsbG8gd29ybGQh"),
                ),
                List: []string{
                    "list",
                    "list",
                },
                Set: []string{
                    "set",
                },
                Map: map[int]string{
                    1: "map",
                },
                Bigint: fern.String(
                    "1000000",
                ),
            },
        },
        &types.NestedObjectWithRequiredField{
            FieldString: "string",
            NestedObject: &types.ObjectWithOptionalField{
                FieldString: fern.String(
                    "string",
                ),
                Integer: fern.Int(
                    1,
                ),
                Long: fern.Int64(
                    int64(1000000),
                ),
                Double: fern.Float64(
                    1.1,
                ),
                Bool: fern.Bool(
                    true,
                ),
                Datetime: fern.Time(
                    fern.MustParseDateTime(
                        "2024-01-15T09:30:00Z",
                    ),
                ),
                Date: fern.Time(
                    fern.MustParseDate(
                        "2023-01-15",
                    ),
                ),
                UUID: fern.UUID(
                    uuid.MustParse(
                        "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                    ),
                ),
                Base64: fern.Bytes(
                    []byte("SGVsbG8gd29ybGQh"),
                ),
                List: []string{
                    "list",
                    "list",
                },
                Set: []string{
                    "set",
                },
                Map: map[int]string{
                    1: "map",
                },
                Bigint: fern.String(
                    "1000000",
                ),
            },
        },
    }
client.Endpoints.Object.GetAndReturnNestedWithRequiredFieldAsList(
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

**request:** `[]*types.NestedObjectWithRequiredField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Object.GetAndReturnWithUnknownField(request) -> *types.ObjectWithUnknownField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &types.ObjectWithUnknownField{
        Unknown: map[string]any{
            "$ref": "https://example.com/schema",
        },
    }
client.Endpoints.Object.GetAndReturnWithUnknownField(
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

**request:** `*types.ObjectWithUnknownField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Object.GetAndReturnWithDocumentedUnknownType(request) -> *types.ObjectWithDocumentedUnknownType</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &types.ObjectWithDocumentedUnknownType{
        DocumentedUnknownType: map[string]any{
            "key": "value",
        },
    }
client.Endpoints.Object.GetAndReturnWithDocumentedUnknownType(
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

**request:** `*types.ObjectWithDocumentedUnknownType` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Object.GetAndReturnMapOfDocumentedUnknownType(request) -> types.MapOfDocumentedUnknownType</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := map[string]types.DocumentedUnknownType{
        "string": map[string]any{
            "key": "value",
        },
    }
client.Endpoints.Object.GetAndReturnMapOfDocumentedUnknownType(
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

**request:** `types.MapOfDocumentedUnknownType` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Object.GetAndReturnWithDatetimeLikeString(request) -> *types.ObjectWithDatetimeLikeString</code></summary>
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
request := &types.ObjectWithDatetimeLikeString{
        DatetimeLikeString: "2023-08-31T14:15:22Z",
        ActualDatetime: fern.MustParseDateTime(
            "2023-08-31T14:15:22Z",
        ),
    }
client.Endpoints.Object.GetAndReturnWithDatetimeLikeString(
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

**request:** `*types.ObjectWithDatetimeLikeString` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Pagination
<details><summary><code>client.Endpoints.Pagination.ListItems() -> *endpoints.PaginatedResponse</code></summary>
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
request := &endpoints.ListItemsRequest{
        Cursor: fern.String(
            "cursor",
        ),
        Limit: fern.Int(
            1,
        ),
    }
client.Endpoints.Pagination.ListItems(
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

## Endpoints Params
<details><summary><code>client.Endpoints.Params.GetWithPath(Param) -> string</code></summary>
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
client.Endpoints.Params.GetWithPath(
        context.TODO(),
        "param",
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

<details><summary><code>client.Endpoints.Params.GetWithInlinePath(Param) -> string</code></summary>
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
client.Endpoints.Params.GetWithPath(
        context.TODO(),
        "param",
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

<details><summary><code>client.Endpoints.Params.GetWithQuery() -> error</code></summary>
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
request := &endpoints.GetWithQuery{
        Query: "query",
        Number: 1,
    }
client.Endpoints.Params.GetWithQuery(
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

<details><summary><code>client.Endpoints.Params.GetWithAllowMultipleQuery() -> error</code></summary>
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
request := &endpoints.GetWithQuery{
        Query: "query",
        Number: 1,
    }
client.Endpoints.Params.GetWithQuery(
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

<details><summary><code>client.Endpoints.Params.GetWithPathAndQuery(Param) -> error</code></summary>
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
request := &endpoints.GetWithPathAndQuery{
        Query: "query",
    }
client.Endpoints.Params.GetWithPathAndQuery(
        context.TODO(),
        "param",
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

<details><summary><code>client.Endpoints.Params.GetWithInlinePathAndQuery(Param) -> error</code></summary>
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
request := &endpoints.GetWithPathAndQuery{
        Query: "query",
    }
client.Endpoints.Params.GetWithPathAndQuery(
        context.TODO(),
        "param",
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

<details><summary><code>client.Endpoints.Params.ModifyWithPath(Param, request) -> string</code></summary>
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
client.Endpoints.Params.ModifyWithPath(
        context.TODO(),
        "param",
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

<details><summary><code>client.Endpoints.Params.ModifyWithInlinePath(Param, request) -> string</code></summary>
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
client.Endpoints.Params.ModifyWithPath(
        context.TODO(),
        "param",
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

<details><summary><code>client.Endpoints.Params.UploadWithPath(Param, request) -> *types.ObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

POST bytes with path param returning object
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
client.Endpoints.Params.UploadWithPath(
        context.TODO(),
        "upload-path",
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

<details><summary><code>client.Endpoints.Params.GetWithPathAndErrors(Param) -> string</code></summary>
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
client.Endpoints.Params.GetWithPath(
        context.TODO(),
        "param",
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

## Endpoints Primitive
<details><summary><code>client.Endpoints.Primitive.GetAndReturnString(request) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Endpoints.Primitive.GetAndReturnString(
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

<details><summary><code>client.Endpoints.Primitive.GetAndReturnInt(request) -> int</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Endpoints.Primitive.GetAndReturnInt(
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

<details><summary><code>client.Endpoints.Primitive.GetAndReturnLong(request) -> int64</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Endpoints.Primitive.GetAndReturnLong(
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

<details><summary><code>client.Endpoints.Primitive.GetAndReturnDouble(request) -> float64</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Endpoints.Primitive.GetAndReturnDouble(
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

<details><summary><code>client.Endpoints.Primitive.GetAndReturnBool(request) -> bool</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Endpoints.Primitive.GetAndReturnBool(
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

<details><summary><code>client.Endpoints.Primitive.GetAndReturnDatetime(request) -> time.Time</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Endpoints.Primitive.GetAndReturnDatetime(
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

<details><summary><code>client.Endpoints.Primitive.GetAndReturnDate(request) -> time.Time</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Endpoints.Primitive.GetAndReturnDate(
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

<details><summary><code>client.Endpoints.Primitive.GetAndReturnUUID(request) -> uuid.UUID</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Endpoints.Primitive.GetAndReturnUUID(
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

**request:** `uuid.UUID` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Primitive.GetAndReturnBase64(request) -> []byte</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Endpoints.Primitive.GetAndReturnBase64(
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

**request:** `[]byte` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Put
<details><summary><code>client.Endpoints.Put.Add(ID) -> *endpoints.PutResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &endpoints.PutRequest{
        ID: "id",
    }
client.Endpoints.Put.Add(
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

## Endpoints Union
<details><summary><code>client.Endpoints.Union.GetAndReturnUnion(request) -> *types.Animal</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &types.Animal{
        Dog: &types.Dog{
            Name: "name",
            LikesToWoof: true,
        },
    }
client.Endpoints.Union.GetAndReturnUnion(
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

**request:** `*types.Animal` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints URLs
<details><summary><code>client.Endpoints.URLs.WithMixedCase() -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Endpoints.URLs.WithMixedCase(
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

<details><summary><code>client.Endpoints.URLs.NoEndingSlash() -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Endpoints.URLs.NoEndingSlash(
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

<details><summary><code>client.Endpoints.URLs.WithEndingSlash() -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Endpoints.URLs.WithEndingSlash(
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

<details><summary><code>client.Endpoints.URLs.WithUnderscores() -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Endpoints.URLs.WithUnderscores(
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

## InlinedRequests
<details><summary><code>client.InlinedRequests.PostWithObjectBodyandResponse(request) -> *types.ObjectWithOptionalField</code></summary>
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
request := &fern.PostWithObjectBody{
        FieldString: "string",
        Integer: 1,
        NestedObject: &types.ObjectWithOptionalField{
            FieldString: fern.String(
                "string",
            ),
            Integer: fern.Int(
                1,
            ),
            Long: fern.Int64(
                int64(1000000),
            ),
            Double: fern.Float64(
                1.1,
            ),
            Bool: fern.Bool(
                true,
            ),
            Datetime: fern.Time(
                fern.MustParseDateTime(
                    "2024-01-15T09:30:00Z",
                ),
            ),
            Date: fern.Time(
                fern.MustParseDate(
                    "2023-01-15",
                ),
            ),
            UUID: fern.UUID(
                uuid.MustParse(
                    "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                ),
            ),
            Base64: fern.Bytes(
                []byte("SGVsbG8gd29ybGQh"),
            ),
            List: []string{
                "list",
                "list",
            },
            Set: []string{
                "set",
            },
            Map: map[int]string{
                1: "map",
            },
            Bigint: fern.String(
                "1000000",
            ),
        },
    }
client.InlinedRequests.PostWithObjectBodyandResponse(
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

**nestedObject:** `*types.ObjectWithOptionalField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## NoAuth
<details><summary><code>client.NoAuth.PostWithNoAuth(request) -> bool</code></summary>
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
client.NoAuth.PostWithNoAuth(
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

## NoReqBody
<details><summary><code>client.NoReqBody.GetWithNoRequestBody() -> *types.ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.NoReqBody.GetWithNoRequestBody(
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

<details><summary><code>client.NoReqBody.PostWithNoRequestBody() -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.NoReqBody.PostWithNoRequestBody(
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

## ReqWithHeaders
<details><summary><code>client.ReqWithHeaders.GetWithCustomHeader(request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.ReqWithHeaders{
        XTestServiceHeader: "X-TEST-SERVICE-HEADER",
        XTestEndpointHeader: "X-TEST-ENDPOINT-HEADER",
        Body: "string",
    }
client.ReqWithHeaders.GetWithCustomHeader(
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

**xTestEndpointHeader:** `string` 
    
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

