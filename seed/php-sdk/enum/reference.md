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
    new HeadersSendRequest([
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

## Inlinedrequest
<details><summary><code>$client-&gt;inlinedrequest-&gt;send($request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->inlinedrequest->send(
    new InlinedRequestSendRequest([
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

## Multipartform
<details><summary><code>$client-&gt;multipartform-&gt;multipartform($request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->multipartform->multipartform(
    new MultipartFormMultipartFormRequest([]),
);
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Pathparam
<details><summary><code>$client-&gt;pathparam-&gt;send($operand, $operandOrColor)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->pathparam->send(
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

## Queryparam
<details><summary><code>$client-&gt;queryparam-&gt;send($request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->queryparam->send(
    new QueryParamSendRequest([
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

<details><summary><code>$client-&gt;queryparam-&gt;sendlist($request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->queryparam->sendlist(
    new QueryParamSendListRequest([
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

**$operand:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$maybeOperand:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$operandOrColor:** `string|null` 
    
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

