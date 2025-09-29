# Reference
## Headers
<details><summary><code>client.headers.send()</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.headers().send(
    SendEnumAsHeaderRequest
        .builder()
        .operand(Operand.GREATER_THAN)
        .operandOrColor(
            ColorOrOperand.of(Color.RED)
        )
        .maybeOperand(Operand.GREATER_THAN)
        .build()
);
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

**operand:** `Operand` 
    
</dd>
</dl>

<dl>
<dd>

**maybeOperand:** `Optional<Operand>` 
    
</dd>
</dl>

<dl>
<dd>

**operandOrColor:** `ColorOrOperand` 
    
</dd>
</dl>

<dl>
<dd>

**maybeOperandOrColor:** `Optional<ColorOrOperand>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## InlinedRequest
<details><summary><code>client.inlinedRequest.send(request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.inlinedRequest().send(
    SendEnumInlinedRequest
        .builder()
        .operand(Operand.GREATER_THAN)
        .operandOrColor(
            ColorOrOperand.of(Color.RED)
        )
        .build()
);
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

**operand:** `Operand` 
    
</dd>
</dl>

<dl>
<dd>

**maybeOperand:** `Optional<Operand>` 
    
</dd>
</dl>

<dl>
<dd>

**operandOrColor:** `ColorOrOperand` 
    
</dd>
</dl>

<dl>
<dd>

**maybeOperandOrColor:** `Optional<ColorOrOperand>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## PathParam
<details><summary><code>client.pathParam.send(operand, operandOrColor)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.pathParam().send(
    Operand.GREATER_THAN,
    ColorOrOperand.of(Color.RED)
);
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

**operand:** `Operand` 
    
</dd>
</dl>

<dl>
<dd>

**operandOrColor:** `ColorOrOperand` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## QueryParam
<details><summary><code>client.queryParam.send()</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.queryParam().send(
    SendEnumAsQueryParamRequest
        .builder()
        .operand(Operand.GREATER_THAN)
        .operandOrColor(
            ColorOrOperand.of(Color.RED)
        )
        .build()
);
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

**operand:** `Operand` 
    
</dd>
</dl>

<dl>
<dd>

**maybeOperand:** `Optional<Operand>` 
    
</dd>
</dl>

<dl>
<dd>

**operandOrColor:** `ColorOrOperand` 
    
</dd>
</dl>

<dl>
<dd>

**maybeOperandOrColor:** `Optional<ColorOrOperand>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.queryParam.sendList()</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.queryParam().sendList(
    SendEnumListAsQueryParamRequest
        .builder()
        .operand(
            Arrays.asList(Operand.GREATER_THAN)
        )
        .maybeOperand(
            Arrays.asList(Optional.of(Operand.GREATER_THAN))
        )
        .operandOrColor(
            Arrays.asList(
                ColorOrOperand.of(Color.RED)
            )
        )
        .maybeOperandOrColor(
            Arrays.asList(
                Optional.of(
                    ColorOrOperand.of(Color.RED)
                )
            )
        )
        .build()
);
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

**operand:** `Operand` 
    
</dd>
</dl>

<dl>
<dd>

**maybeOperand:** `Optional<Operand>` 
    
</dd>
</dl>

<dl>
<dd>

**operandOrColor:** `ColorOrOperand` 
    
</dd>
</dl>

<dl>
<dd>

**maybeOperandOrColor:** `Optional<ColorOrOperand>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
