# Reference
## Headers
<details><summary><code>$client-&gt;headers-&gt;send($request) -> ?SendResponse</code></summary>
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
        'endpointVersion' => HeadersSendRequestXEndpointVersion::Two122024->value,
        'async' => true,
        'query' => 'query',
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
<details><summary><code>$client-&gt;inlined-&gt;send($request) -> ?SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->inlined->send(
    new InlinedSendRequest([
        'prompt' => InlinedSendRequestPrompt::YouAreAHelpfulAssistant->value,
        'query' => 'query',
        'stream' => true,
        'aliasedContext' => SomeAliasedLiteral::YoureSuperWise->value,
        'objectWithLiteral' => new ATopLevelLiteral([
            'nestedLiteral' => new ANestedLiteral([
                'myLiteral' => ANestedLiteralMyLiteral::HowSuperCool->value,
            ]),
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
<details><summary><code>$client-&gt;path-&gt;send($id) -> ?SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->path->send(
    PathSendRequestId::OneHundredTwentyThree->value,
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
<details><summary><code>$client-&gt;query-&gt;send($request) -> ?SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->query->send(
    new QuerySendRequest([
        'prompt' => QuerySendRequestPrompt::YouAreAHelpfulAssistant->value,
        'aliasPrompt' => AliasToPrompt::YouAreAHelpfulAssistant->value,
        'query' => 'query',
        'stream' => true,
        'aliasStream' => true,
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
<details><summary><code>$client-&gt;reference-&gt;send($request) -> ?SendResponse</code></summary>
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
        'prompt' => SendRequestPrompt::YouAreAHelpfulAssistant->value,
        'query' => 'query',
        'stream' => true,
        'ending' => SendRequestEnding::Ending->value,
        'context' => SomeLiteral::YoureSuperWise->value,
        'containerObject' => new ContainerObject([
            'nestedObjects' => [
                new NestedObjectWithLiterals([
                    'literal1' => NestedObjectWithLiteralsLiteral1::Literal1->value,
                    'literal2' => NestedObjectWithLiteralsLiteral2::Literal2->value,
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

**$prompt:** `string` 
    
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

**$ending:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$context:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$maybeContext:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$containerObject:** `ContainerObject` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

