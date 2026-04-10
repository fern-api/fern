# Reference
## Union
<details><summary><code>client.Union.Get(request) -> *undiscriminated.MyUnion</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &undiscriminated.MyUnion{
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

**request:** `*undiscriminated.MyUnion` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Union.Getmetadata() -> undiscriminated.Metadata</code></summary>
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
request := &undiscriminated.MetadataUnion{
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

**request:** `*undiscriminated.MetadataUnion` 
    
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
request := &undiscriminated.Request{}
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

**union:** `*undiscriminated.MetadataUnion` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Union.Duplicatetypesunion(request) -> *undiscriminated.UnionWithDuplicateTypes</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &undiscriminated.UnionWithDuplicateTypes{
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

**request:** `*undiscriminated.UnionWithDuplicateTypes` 
    
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
request := &undiscriminated.NestedUnionRoot{
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

**request:** `*undiscriminated.NestedUnionRoot` 
    
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
request := &undiscriminated.UnionTestCamelCasePropertiesRequest{
        PaymentMethod: &undiscriminated.PaymentMethodUnion{
            TokenizeCard: &undiscriminated.TokenizeCard{
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

**paymentMethod:** `*undiscriminated.PaymentMethodUnion` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

