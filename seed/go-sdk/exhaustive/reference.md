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
client.Endpoints.Container.GetAndReturnListOfPrimitives(
        context.TODO(),
        []string{
            "string",
            "string",
        },
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
client.Endpoints.Container.GetAndReturnListOfObjects(
        context.TODO(),
        []*types.ObjectWithRequiredField{
            &types.ObjectWithRequiredField{
                String: "string",
            },
            &types.ObjectWithRequiredField{
                String: "string",
            },
        },
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
client.Endpoints.Container.GetAndReturnSetOfPrimitives(
        context.TODO(),
        []string{
            "string",
        },
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
client.Endpoints.Container.GetAndReturnSetOfObjects(
        context.TODO(),
        []*types.ObjectWithRequiredField{
            &types.ObjectWithRequiredField{
                String: "string",
            },
        },
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
client.Endpoints.Container.GetAndReturnMapPrimToPrim(
        context.TODO(),
        map[string]string{
            "string": "string",
        },
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
client.Endpoints.Container.GetAndReturnMapOfPrimToObject(
        context.TODO(),
        map[string]*types.ObjectWithRequiredField{
            "string": &types.ObjectWithRequiredField{
                String: "string",
            },
        },
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

<details><summary><code>client.Endpoints.Container.GetAndReturnOptional(request) -> *types.ObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Endpoints.Container.GetAndReturnOptional(
        context.TODO(),
        &types.ObjectWithRequiredField{
            String: "string",
        },
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
<details><summary><code>client.Endpoints.ContentType.PostJsonPatchContentType(request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Endpoints.ContentType.PostJsonPatchContentType(
        context.TODO(),
        &types.ObjectWithOptionalField{
            String: fern.String(
                "string",
            ),
            Integer: fern.Int(
                1,
            ),
            Long: fern.Int64(
                1000000,
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
                fern.MustParseDateTime(
                    "2023-01-15",
                ),
            ),
            Uuid: fern.UUID(
                uuid.MustParse(
                    "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                ),
            ),
            Base64: []byte("SGVsbG8gd29ybGQh"),
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

<details><summary><code>client.Endpoints.ContentType.PostJsonPatchContentWithCharsetType(request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Endpoints.ContentType.PostJsonPatchContentWithCharsetType(
        context.TODO(),
        &types.ObjectWithOptionalField{
            String: fern.String(
                "string",
            ),
            Integer: fern.Int(
                1,
            ),
            Long: fern.Int64(
                1000000,
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
                fern.MustParseDateTime(
                    "2023-01-15",
                ),
            ),
            Uuid: fern.UUID(
                uuid.MustParse(
                    "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                ),
            ),
            Base64: []byte("SGVsbG8gd29ybGQh"),
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
        types.WeatherReportSunny,
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

## Endpoints HttpMethods
<details><summary><code>client.Endpoints.HttpMethods.TestGet(Id) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Endpoints.HttpMethods.TestGet(
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

<details><summary><code>client.Endpoints.HttpMethods.TestPost(request) -> *types.ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Endpoints.HttpMethods.TestPost(
        context.TODO(),
        &types.ObjectWithRequiredField{
            String: "string",
        },
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

<details><summary><code>client.Endpoints.HttpMethods.TestPut(Id, request) -> *types.ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Endpoints.HttpMethods.TestPut(
        context.TODO(),
        "id",
        &types.ObjectWithRequiredField{
            String: "string",
        },
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

<details><summary><code>client.Endpoints.HttpMethods.TestPatch(Id, request) -> *types.ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Endpoints.HttpMethods.TestPatch(
        context.TODO(),
        "id",
        &types.ObjectWithOptionalField{
            String: fern.String(
                "string",
            ),
            Integer: fern.Int(
                1,
            ),
            Long: fern.Int64(
                1000000,
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
                fern.MustParseDateTime(
                    "2023-01-15",
                ),
            ),
            Uuid: fern.UUID(
                uuid.MustParse(
                    "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                ),
            ),
            Base64: []byte("SGVsbG8gd29ybGQh"),
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

<details><summary><code>client.Endpoints.HttpMethods.TestDelete(Id) -> bool</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Endpoints.HttpMethods.TestDelete(
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
client.Endpoints.Object.GetAndReturnWithOptionalField(
        context.TODO(),
        &types.ObjectWithOptionalField{
            String: fern.String(
                "string",
            ),
            Integer: fern.Int(
                1,
            ),
            Long: fern.Int64(
                1000000,
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
                fern.MustParseDateTime(
                    "2023-01-15",
                ),
            ),
            Uuid: fern.UUID(
                uuid.MustParse(
                    "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                ),
            ),
            Base64: []byte("SGVsbG8gd29ybGQh"),
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
client.Endpoints.Object.GetAndReturnWithRequiredField(
        context.TODO(),
        &types.ObjectWithRequiredField{
            String: "string",
        },
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
client.Endpoints.Object.GetAndReturnWithMapOfMap(
        context.TODO(),
        &types.ObjectWithMapOfMap{
            Map: map[string]map[string]string{
                "map": map[string]string{
                    "map": "map",
                },
            },
        },
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
client.Endpoints.Object.GetAndReturnNestedWithOptionalField(
        context.TODO(),
        &types.NestedObjectWithOptionalField{
            String: fern.String(
                "string",
            ),
            NestedObject: &types.ObjectWithOptionalField{
                String: fern.String(
                    "string",
                ),
                Integer: fern.Int(
                    1,
                ),
                Long: fern.Int64(
                    1000000,
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
                    fern.MustParseDateTime(
                        "2023-01-15",
                    ),
                ),
                Uuid: fern.UUID(
                    uuid.MustParse(
                        "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                    ),
                ),
                Base64: []byte("SGVsbG8gd29ybGQh"),
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
client.Endpoints.Object.GetAndReturnNestedWithRequiredField(
        context.TODO(),
        "string",
        &types.NestedObjectWithRequiredField{
            String: "string",
            NestedObject: &types.ObjectWithOptionalField{
                String: fern.String(
                    "string",
                ),
                Integer: fern.Int(
                    1,
                ),
                Long: fern.Int64(
                    1000000,
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
                    fern.MustParseDateTime(
                        "2023-01-15",
                    ),
                ),
                Uuid: fern.UUID(
                    uuid.MustParse(
                        "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                    ),
                ),
                Base64: []byte("SGVsbG8gd29ybGQh"),
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
client.Endpoints.Object.GetAndReturnNestedWithRequiredFieldAsList(
        context.TODO(),
        []*types.NestedObjectWithRequiredField{
            &types.NestedObjectWithRequiredField{
                String: "string",
                NestedObject: &types.ObjectWithOptionalField{
                    String: fern.String(
                        "string",
                    ),
                    Integer: fern.Int(
                        1,
                    ),
                    Long: fern.Int64(
                        1000000,
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
                        fern.MustParseDateTime(
                            "2023-01-15",
                        ),
                    ),
                    Uuid: fern.UUID(
                        uuid.MustParse(
                            "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                        ),
                    ),
                    Base64: []byte("SGVsbG8gd29ybGQh"),
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
                String: "string",
                NestedObject: &types.ObjectWithOptionalField{
                    String: fern.String(
                        "string",
                    ),
                    Integer: fern.Int(
                        1,
                    ),
                    Long: fern.Int64(
                        1000000,
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
                        fern.MustParseDateTime(
                            "2023-01-15",
                        ),
                    ),
                    Uuid: fern.UUID(
                        uuid.MustParse(
                            "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                        ),
                    ),
                    Base64: []byte("SGVsbG8gd29ybGQh"),
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
        },
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

<details><summary><code>client.Endpoints.Object.TestIntegerOverflowEdgeCases(request) -> *types.ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Endpoints.Object.TestIntegerOverflowEdgeCases(
        context.TODO(),
        &types.ObjectWithOptionalField{
            String: fern.String(
                "boundary-test",
            ),
            Integer: fern.Int(
                2147483647,
            ),
            Double: fern.Float64(
                1.7976931348623157e+308,
            ),
            Bool: fern.Bool(
                true,
            ),
        },
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
client.Endpoints.Params.GetWithQuery(
        context.TODO(),
        &endpoints.GetWithQuery{
            Query: "query",
            Number: 1,
        },
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
client.Endpoints.Params.GetWithQuery(
        context.TODO(),
        &endpoints.GetWithQuery{
            Query: "query",
            Number: 1,
        },
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
client.Endpoints.Params.GetWithPathAndQuery(
        context.TODO(),
        "param",
        &endpoints.GetWithPathAndQuery{
            Query: "query",
        },
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
client.Endpoints.Params.GetWithPathAndQuery(
        context.TODO(),
        "param",
        &endpoints.GetWithPathAndQuery{
            Query: "query",
        },
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
        "string",
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
        "string",
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
        "string",
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
        1,
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
        1000000,
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
        1.1,
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
        true,
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
        fern.MustParseDateTime(
            "2024-01-15T09:30:00Z",
        ),
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
        fern.MustParseDateTime(
            "2023-01-15",
        ),
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

<details><summary><code>client.Endpoints.Primitive.GetAndReturnUuid(request) -> uuid.UUID</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Endpoints.Primitive.GetAndReturnUuid(
        context.TODO(),
        uuid.MustParse(
            "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
        ),
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
        []byte("SGVsbG8gd29ybGQh"),
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
<details><summary><code>client.Endpoints.Put.Add(Id) -> *endpoints.PutResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Endpoints.Put.Add(
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
client.Endpoints.Union.GetAndReturnUnion(
        context.TODO(),
        &types.Animal{
            Dog: &types.Dog{
                Name: "name",
                LikesToWoof: true,
            },
        },
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

## Endpoints Urls
<details><summary><code>client.Endpoints.Urls.WithMixedCase() -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Endpoints.Urls.WithMixedCase(
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

<details><summary><code>client.Endpoints.Urls.NoEndingSlash() -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Endpoints.Urls.NoEndingSlash(
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

<details><summary><code>client.Endpoints.Urls.WithEndingSlash() -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Endpoints.Urls.WithEndingSlash(
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

<details><summary><code>client.Endpoints.Urls.WithUnderscores() -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Endpoints.Urls.WithUnderscores(
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
client.InlinedRequests.PostWithObjectBodyandResponse(
        context.TODO(),
        &fern.PostWithObjectBody{
            String: "string",
            Integer: 1,
            NestedObject: &types.ObjectWithOptionalField{
                String: fern.String(
                    "string",
                ),
                Integer: fern.Int(
                    1,
                ),
                Long: fern.Int64(
                    1000000,
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
                    fern.MustParseDateTime(
                        "2023-01-15",
                    ),
                ),
                Uuid: fern.UUID(
                    uuid.MustParse(
                        "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                    ),
                ),
                Base64: []byte("SGVsbG8gd29ybGQh"),
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
client.NoAuth.PostWithNoAuth(
        context.TODO(),
        map[string]any{
            "key": "value",
        },
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
client.ReqWithHeaders.GetWithCustomHeader(
        context.TODO(),
        &fern.ReqWithHeaders{
            XTestServiceHeader: "X-TEST-SERVICE-HEADER",
            XTestEndpointHeader: "X-TEST-ENDPOINT-HEADER",
            Body: "string",
        },
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
