# Reference
## Bigunion
<details><summary><code>client.Bigunion.Get(Id) -> *fern.BigUnion</code></summary>
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
client.Bigunion.Update(
        context.TODO(),
        &fern.BigUnion{
            NormalSweet: &fern.NormalSweet{
                Value: "value",
            },
            Id: "id",
            CreatedAt: fern.MustParseDateTime(
                "2024-01-15T09:30:00Z",
            ),
            ArchivedAt: fern.Time(
                fern.MustParseDateTime(
                    "2024-01-15T09:30:00Z",
                ),
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

**request:** `*fern.BigUnion` 
    
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
client.Bigunion.UpdateMany(
        context.TODO(),
        []*fern.BigUnion{
            &fern.BigUnion{
                NormalSweet: &fern.NormalSweet{
                    Value: "value",
                },
                Id: "id",
                CreatedAt: fern.MustParseDateTime(
                    "2024-01-15T09:30:00Z",
                ),
                ArchivedAt: fern.Time(
                    fern.MustParseDateTime(
                        "2024-01-15T09:30:00Z",
                    ),
                ),
            },
            &fern.BigUnion{
                NormalSweet: &fern.NormalSweet{
                    Value: "value",
                },
                Id: "id",
                CreatedAt: fern.MustParseDateTime(
                    "2024-01-15T09:30:00Z",
                ),
                ArchivedAt: fern.Time(
                    fern.MustParseDateTime(
                        "2024-01-15T09:30:00Z",
                    ),
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

**request:** `[]*fern.BigUnion` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Union
<details><summary><code>client.Union.Get(Id) -> *fern.Shape</code></summary>
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
client.Union.Update(
        context.TODO(),
        &fern.Shape{
            Circle: &fern.Circle{
                Radius: 1.1,
            },
            Id: "id",
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

**request:** `*fern.Shape` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
