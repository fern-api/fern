# Reference
## Headers
<details><summary><code>$client->headers->send($request) -> SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->headers->send(
    new SendLiteralsInHeadersRequest([
        'endpointVersion' => '02-12-2024',
        'async' => true,
        'query' => 'What is the weather today',
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

**$endpointVersion:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$async:** `bool` 
    
</dd>
</dl>

<dl>
<dd>

**$query:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Inlined
<details><summary><code>$client->inlined->send($request) -> SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->inlined->send(
    new SendLiteralsInlinedRequest([
        'temperature' => 10.1,
        'prompt' => 'You are a helpful assistant',
        'context' => "You're super wise",
        'aliasedContext' => "You're super wise",
        'maybeContext' => "You're super wise",
        'objectWithLiteral' => new ATopLevelLiteral([
            'nestedLiteral' => new ANestedLiteral([
                'myLiteral' => 'How super cool',
            ]),
        ]),
        'stream' => false,
        'query' => 'What is the weather today',
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

**$prompt:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$context:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$query:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$temperature:** `?float` 
    
</dd>
</dl>

<dl>
<dd>

**$stream:** `bool` 
    
</dd>
</dl>

<dl>
<dd>

**$aliasedContext:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$maybeContext:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$objectWithLiteral:** `ATopLevelLiteral` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Path
<details><summary><code>$client->path->send($id) -> SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->path->send(
    '123',
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

**$id:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Query
<details><summary><code>$client->query->send($request) -> SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->query->send(
    new SendLiteralsInQueryRequest([
        'prompt' => 'You are a helpful assistant',
        'optionalPrompt' => 'You are a helpful assistant',
        'aliasPrompt' => 'You are a helpful assistant',
        'aliasOptionalPrompt' => 'You are a helpful assistant',
        'stream' => false,
        'optionalStream' => false,
        'aliasStream' => false,
        'aliasOptionalStream' => false,
        'query' => 'What is the weather today',
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

**$prompt:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$optionalPrompt:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$aliasPrompt:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$aliasOptionalPrompt:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$query:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$stream:** `bool` 
    
</dd>
</dl>

<dl>
<dd>

**$optionalStream:** `?bool` 
    
</dd>
</dl>

<dl>
<dd>

**$aliasStream:** `bool` 
    
</dd>
</dl>

<dl>
<dd>

**$aliasOptionalStream:** `?bool` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Reference
<details><summary><code>$client->reference->send($request) -> SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->reference->send(
    new SendRequest([
        'prompt' => 'You are a helpful assistant',
        'stream' => false,
        'context' => "You're super wise",
        'query' => 'What is the weather today',
        'containerObject' => new ContainerObject([
            'nestedObjects' => [
                new NestedObjectWithLiterals([
                    'literal1' => 'literal1',
                    'literal2' => 'literal2',
                    'strProp' => 'strProp',
                ]),
            ],
        ]),
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

**$request:** `SendRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
