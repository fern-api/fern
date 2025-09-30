# Reference
## Bigunion
<details><summary><code>client.Bigunion.Get(Id) -> *unionsgo.BigUnion</code></summary>
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
request := &unionsgo.BigUnion{
        NormalSweet: &unionsgo.NormalSweet{
            Value: "value",
        },
        Id: "id",
        CreatedAt: unionsgo.MustParseDateTime(
            "2024-01-15T09:30:00Z",
        ),
        ArchivedAt: unionsgo.Time(
            unionsgo.MustParseDateTime(
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

**request:** `*unionsgo.BigUnion` 
    
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
request := []*unionsgo.BigUnion{
        &unionsgo.BigUnion{
            NormalSweet: &unionsgo.NormalSweet{
                Value: "value",
            },
            Id: "id",
            CreatedAt: unionsgo.MustParseDateTime(
                "2024-01-15T09:30:00Z",
            ),
            ArchivedAt: unionsgo.Time(
                unionsgo.MustParseDateTime(
                    "2024-01-15T09:30:00Z",
                ),
            ),
        },
        &unionsgo.BigUnion{
            NormalSweet: &unionsgo.NormalSweet{
                Value: "value",
            },
            Id: "id",
            CreatedAt: unionsgo.MustParseDateTime(
                "2024-01-15T09:30:00Z",
            ),
            ArchivedAt: unionsgo.Time(
                unionsgo.MustParseDateTime(
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

**request:** `[]*unionsgo.BigUnion` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Union
<details><summary><code>client.Union.Get(Id) -> *unionsgo.Shape</code></summary>
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
request := &unionsgo.Shape{
        Circle: &unionsgo.Circle{
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

**request:** `*unionsgo.Shape` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
