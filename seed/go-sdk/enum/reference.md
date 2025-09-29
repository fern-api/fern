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
