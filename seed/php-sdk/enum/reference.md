# Reference
## Headers
<details><summary><code>$client-&gt;headers-&gt;send($request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->headers->send(
    new SendEnumAsHeaderRequest([
        'operand' => Operand::GreaterThan->value,
        'maybeOperand' => Operand::GreaterThan->value,
        'operandOrColor' => Color::Red->value,
    ]),
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

**$operand:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$maybeOperand:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$operandOrColor:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$maybeOperandOrColor:** `string|null` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## InlinedRequest
<details><summary><code>$client-&gt;inlinedRequest-&gt;send($request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->inlinedRequest->send(
    new SendEnumInlinedRequest([
        'operand' => Operand::GreaterThan->value,
        'operandOrColor' => Color::Red->value,
    ]),
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

**$operand:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$maybeOperand:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$operandOrColor:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$maybeOperandOrColor:** `string|null` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## MultipartForm
<details><summary><code>$client-&gt;multipartForm-&gt;multipartForm($request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->multipartForm->multipartForm($request);
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## PathParam
<details><summary><code>$client-&gt;pathParam-&gt;send($operand, $operandOrColor)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->pathParam->send(
    Operand::GreaterThan->value,
    Color::Red->value,
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

**$operand:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$operandOrColor:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## QueryParam
<details><summary><code>$client-&gt;queryParam-&gt;send($request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->queryParam->send(
    new SendEnumAsQueryParamRequest([
        'operand' => Operand::GreaterThan->value,
        'operandOrColor' => Color::Red->value,
    ]),
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

**$operand:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$maybeOperand:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$operandOrColor:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$maybeOperandOrColor:** `string|null` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;queryParam-&gt;sendList($request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->queryParam->sendList(
    new SendEnumListAsQueryParamRequest([
        'operand' => [
            Operand::GreaterThan->value,
        ],
        'maybeOperand' => [
            Operand::GreaterThan->value,
        ],
        'operandOrColor' => [
            Color::Red->value,
        ],
        'maybeOperandOrColor' => [
            Color::Red->value,
        ],
    ]),
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

**$operand:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$maybeOperand:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$operandOrColor:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$maybeOperandOrColor:** `string|null` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
