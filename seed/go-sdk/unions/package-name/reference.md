# Reference
## Bigunion
<details><summary><code>client.Bigunion.Get(Id) -> *unions.BigUnion</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Bigunion.Get(
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

<details><summary><code>client.Bigunion.Update(request) -> bool</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &unions.BigUnion{
        NormalSweet: &unions.NormalSweet{
            Value: "value",
        },
        Id: "id",
        CreatedAt: unions.MustParseDateTime(
            "2024-01-15T09:30:00Z",
        ),
        ArchivedAt: unions.Time(
            unions.MustParseDateTime(
                "2024-01-15T09:30:00Z",
            ),
        ),
    }
client.Bigunion.Update(
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

**request:** `*unions.BigUnion` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Bigunion.UpdateMany(request) -> map[string]bool</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := []*unions.BigUnion{
        &unions.BigUnion{
            NormalSweet: &unions.NormalSweet{
                Value: "value",
            },
            Id: "id",
            CreatedAt: unions.MustParseDateTime(
                "2024-01-15T09:30:00Z",
            ),
            ArchivedAt: unions.Time(
                unions.MustParseDateTime(
                    "2024-01-15T09:30:00Z",
                ),
            ),
        },
        &unions.BigUnion{
            NormalSweet: &unions.NormalSweet{
                Value: "value",
            },
            Id: "id",
            CreatedAt: unions.MustParseDateTime(
                "2024-01-15T09:30:00Z",
            ),
            ArchivedAt: unions.Time(
                unions.MustParseDateTime(
                    "2024-01-15T09:30:00Z",
                ),
            ),
        },
    }
client.Bigunion.UpdateMany(
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

**request:** `[]*unions.BigUnion` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Union
<details><summary><code>client.Union.Get(Id) -> *unions.Shape</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Bigunion.Get(
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

<details><summary><code>client.Union.Update(request) -> bool</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &unions.Shape{
        Circle: &unions.Circle{
            Radius: 1.1,
        },
        Id: "id",
    }
client.Union.Update(
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

**request:** `*unions.Shape` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
