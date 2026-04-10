# Reference
## Union
<details><summary><code>client.Union.Get(request) -> *fern.MyUnion</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.MyUnion{
        String: "string",
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

**request:** `*fern.MyUnion` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Union.Getmetadata() -> fern.Metadata</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Union.Getmetadata(
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

<details><summary><code>client.Union.Updatemetadata(request) -> bool</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.MetadataUnion{
        OptionalMetadataOptional: map[string]any{
            "key": "value",
        },
    }
client.Union.Updatemetadata(
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

**request:** `*fern.MetadataUnion` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Union.Call(request) -> bool</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.Request{}
client.Union.Call(
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

**union:** `*fern.MetadataUnion` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Union.Duplicatetypesunion(request) -> *fern.UnionWithDuplicateTypes</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.UnionWithDuplicateTypes{
        String: "string",
    }
client.Union.Duplicatetypesunion(
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

**request:** `*fern.UnionWithDuplicateTypes` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Union.Nestedunions(request) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.NestedUnionRoot{
        String: "string",
    }
client.Union.Nestedunions(
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

**request:** `*fern.NestedUnionRoot` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Union.Testcamelcaseproperties(request) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.UnionTestCamelCasePropertiesRequest{
        PaymentMethod: &fern.PaymentMethodUnion{
            TokenizeCard: &fern.TokenizeCard{
                Method: "method",
                CardNumber: "cardNumber",
            },
        },
    }
client.Union.Testcamelcaseproperties(
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

**paymentMethod:** `*fern.PaymentMethodUnion` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

