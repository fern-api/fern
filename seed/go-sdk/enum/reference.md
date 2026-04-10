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
request := &fern.HeadersSendRequest{
        Operand: fern.OperandGreaterThan,
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

## Inlinedrequest
<details><summary><code>client.Inlinedrequest.Send(request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.InlinedRequestSendRequest{
        Operand: fern.OperandGreaterThan,
        OperandOrColor: &fern.ColorOrOperand{
            Color: fern.ColorRed,
        },
    }
client.Inlinedrequest.Send(
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

## Multipartform
<details><summary><code>client.Multipartform.Multipartform(request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.MultipartFormMultipartFormRequest{}
client.Multipartform.Multipartform(
        context.TODO(),
        request,
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

## Pathparam
<details><summary><code>client.Pathparam.Send(Operand, OperandOrColor) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.PathParamSendRequest{
        Operand: fern.OperandGreaterThan.Ptr(),
        OperandOrColor: &fern.ColorOrOperand{
            Color: fern.ColorRed,
        },
    }
client.Pathparam.Send(
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

**operandOrColor:** `*fern.ColorOrOperand` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Queryparam
<details><summary><code>client.Queryparam.Send() -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.QueryParamSendRequest{
        Operand: fern.OperandGreaterThan,
        OperandOrColor: fern.ColorRed,
    }
client.Queryparam.Send(
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

**operandOrColor:** `*fern.Color` 
    
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

<details><summary><code>client.Queryparam.Sendlist() -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.QueryParamSendListRequest{
        Operand: []*fern.Operand{
            fern.OperandGreaterThan.Ptr(),
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
client.Queryparam.Sendlist(
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

