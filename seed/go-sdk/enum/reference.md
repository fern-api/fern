# Reference
## Headers
<details><summary><code>client.Headers.Send() -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.SendEnumAsHeaderRequest{
        Operand: fern.OperandGreaterThan,
        MaybeOperand: fern.OperandGreaterThan.Ptr(),
        OperandOrColor: &fern.ColorOrOperand{
            Color: fern.ColorRed,
        },
    }
client.Headers.Send(
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

**operand:** `*fern.Operand` 
    
</dd>
</dl>

<dl>
<dd>

**maybeOperand:** `*fern.Operand` 
    
</dd>
</dl>

<dl>
<dd>

**operandOrColor:** `*fern.ColorOrOperand` 
    
</dd>
</dl>

<dl>
<dd>

**maybeOperandOrColor:** `*fern.ColorOrOperand` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## InlinedRequest
<details><summary><code>client.InlinedRequest.Send(request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.SendEnumInlinedRequest{
        Operand: fern.OperandGreaterThan,
        OperandOrColor: &fern.ColorOrOperand{
            Color: fern.ColorRed,
        },
    }
client.InlinedRequest.Send(
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

**operand:** `*fern.Operand` 
    
</dd>
</dl>

<dl>
<dd>

**maybeOperand:** `*fern.Operand` 
    
</dd>
</dl>

<dl>
<dd>

**operandOrColor:** `*fern.ColorOrOperand` 
    
</dd>
</dl>

<dl>
<dd>

**maybeOperandOrColor:** `*fern.ColorOrOperand` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## MultipartForm
## PathParam
<details><summary><code>client.PathParam.Send(Operand, OperandOrColor) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.PathParam.Send(
        context.TODO(),
        fern.OperandGreaterThan.Ptr(),
        &fern.ColorOrOperand{
            Color: fern.ColorRed,
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

**operand:** `*fern.Operand` 
    
</dd>
</dl>

<dl>
<dd>

**operandOrColor:** `*fern.ColorOrOperand` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## QueryParam
<details><summary><code>client.QueryParam.Send() -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.SendEnumAsQueryParamRequest{
        Operand: fern.OperandGreaterThan,
        OperandOrColor: &fern.ColorOrOperand{
            Color: fern.ColorRed,
        },
    }
client.QueryParam.Send(
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

**operand:** `*fern.Operand` 
    
</dd>
</dl>

<dl>
<dd>

**maybeOperand:** `*fern.Operand` 
    
</dd>
</dl>

<dl>
<dd>

**operandOrColor:** `*fern.ColorOrOperand` 
    
</dd>
</dl>

<dl>
<dd>

**maybeOperandOrColor:** `*fern.ColorOrOperand` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.QueryParam.SendList() -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.SendEnumListAsQueryParamRequest{
        Operand: []fern.Operand{
            fern.OperandGreaterThan,
        },
        MaybeOperand: []*fern.Operand{
            fern.OperandGreaterThan.Ptr(),
        },
        OperandOrColor: []*fern.ColorOrOperand{
            &fern.ColorOrOperand{
                Color: fern.ColorRed,
            },
        },
        MaybeOperandOrColor: []*fern.ColorOrOperand{
            &fern.ColorOrOperand{
                Color: fern.ColorRed,
            },
        },
    }
client.QueryParam.SendList(
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

**operand:** `*fern.Operand` 
    
</dd>
</dl>

<dl>
<dd>

**maybeOperand:** `*fern.Operand` 
    
</dd>
</dl>

<dl>
<dd>

**operandOrColor:** `*fern.ColorOrOperand` 
    
</dd>
</dl>

<dl>
<dd>

**maybeOperandOrColor:** `*fern.ColorOrOperand` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
