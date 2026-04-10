# Reference
## Bigunion
<details><summary><code>client.Bigunion.Get(ID) -> *unions.BigUnion</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &unions.BigunionGetRequest{
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
request := &unions.BigUnion{
        BigUnionZero: &unions.BigUnionZero{
            Value: "value",
            Type: unions.BigUnionZeroTypeNormalSweet,
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
            BigUnionZero: &unions.BigUnionZero{
                Value: "value",
                Type: unions.BigUnionZeroTypeNormalSweet,
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

**request:** `[]*unions.BigUnion` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Union
<details><summary><code>client.Union.Get(ID) -> *unions.Shape</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &unions.UnionGetRequest{
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
request := &unions.Shape{
        ShapeZero: &unions.ShapeZero{
            Radius: 1.1,
            Type: unions.ShapeZeroTypeCircle,
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

**request:** `*unions.Shape` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

