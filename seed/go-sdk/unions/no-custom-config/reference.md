# Reference
## Bigunion
<details><summary><code>client.Bigunion.Get(ID) -> *fern.BigUnion</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.BigunionGetRequest{
        ID: "id",
    }
client.Bigunion.Get(
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

<details><summary><code>client.Bigunion.Update(request) -> bool</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.BigUnion{
        BigUnionZero: &fern.BigUnionZero{
            Value: "value",
            Type: fern.BigUnionZeroTypeNormalSweet,
        },
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
request := []*fern.BigUnion{
        &fern.BigUnion{
            BigUnionZero: &fern.BigUnionZero{
                Value: "value",
                Type: fern.BigUnionZeroTypeNormalSweet,
            },
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

**request:** `[]*fern.BigUnion` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Union
<details><summary><code>client.Union.Get(ID) -> *fern.Shape</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.UnionGetRequest{
        ID: "id",
    }
client.Union.Get(
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

<details><summary><code>client.Union.Update(request) -> bool</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.Shape{
        ShapeZero: &fern.ShapeZero{
            Radius: 1.1,
            Type: fern.ShapeZeroTypeCircle,
        },
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

**request:** `*fern.Shape` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

