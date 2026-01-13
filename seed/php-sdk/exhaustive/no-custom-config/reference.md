# Reference
## Endpoints Container
<details><summary><code>$client-&gt;endpoints-&gt;container-&gt;getAndReturnListOfPrimitives($request) -> array</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->endpoints->container->getAndReturnListOfPrimitives(
    [
        'string',
        'string',
    ],
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

**$request:** `array` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;endpoints-&gt;container-&gt;getAndReturnListOfObjects($request) -> array</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->endpoints->container->getAndReturnListOfObjects(
    [
        new ObjectWithRequiredField([
            'string' => 'string',
        ]),
        new ObjectWithRequiredField([
            'string' => 'string',
        ]),
    ],
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

**$request:** `array` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;endpoints-&gt;container-&gt;getAndReturnSetOfPrimitives($request) -> array</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->endpoints->container->getAndReturnSetOfPrimitives(
    [
        'string',
    ],
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

**$request:** `array` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;endpoints-&gt;container-&gt;getAndReturnSetOfObjects($request) -> array</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->endpoints->container->getAndReturnSetOfObjects(
    [
        new ObjectWithRequiredField([
            'string' => 'string',
        ]),
    ],
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

**$request:** `array` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;endpoints-&gt;container-&gt;getAndReturnMapPrimToPrim($request) -> array</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->endpoints->container->getAndReturnMapPrimToPrim(
    [
        'string' => 'string',
    ],
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

**$request:** `array` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;endpoints-&gt;container-&gt;getAndReturnMapOfPrimToObject($request) -> array</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->endpoints->container->getAndReturnMapOfPrimToObject(
    [
        'string' => new ObjectWithRequiredField([
            'string' => 'string',
        ]),
    ],
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

**$request:** `array` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;endpoints-&gt;container-&gt;getAndReturnOptional($request) -> ?ObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->endpoints->container->getAndReturnOptional(
    new ObjectWithRequiredField([
        'string' => 'string',
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

**$request:** `?ObjectWithRequiredField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints ContentType
<details><summary><code>$client-&gt;endpoints-&gt;contentType-&gt;postJsonPatchContentType($request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->endpoints->contentType->postJsonPatchContentType(
    new ObjectWithOptionalField([
        'string' => 'string',
        'integer' => 1,
        'long' => 1000000,
        'double' => 1.1,
        'bool' => true,
        'datetime' => new DateTime('2024-01-15T09:30:00Z'),
        'date' => new DateTime('2023-01-15'),
        'uuid' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
        'base64' => 'SGVsbG8gd29ybGQh',
        'list' => [
            'list',
            'list',
        ],
        'set' => [
            'set',
        ],
        'map' => [
            1 => 'map',
        ],
        'bigint' => '1000000',
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

**$request:** `ObjectWithOptionalField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;endpoints-&gt;contentType-&gt;postJsonPatchContentWithCharsetType($request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->endpoints->contentType->postJsonPatchContentWithCharsetType(
    new ObjectWithOptionalField([
        'string' => 'string',
        'integer' => 1,
        'long' => 1000000,
        'double' => 1.1,
        'bool' => true,
        'datetime' => new DateTime('2024-01-15T09:30:00Z'),
        'date' => new DateTime('2023-01-15'),
        'uuid' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
        'base64' => 'SGVsbG8gd29ybGQh',
        'list' => [
            'list',
            'list',
        ],
        'set' => [
            'set',
        ],
        'map' => [
            1 => 'map',
        ],
        'bigint' => '1000000',
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

**$request:** `ObjectWithOptionalField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Enum
<details><summary><code>$client-&gt;endpoints-&gt;enum-&gt;getAndReturnEnum($request) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->endpoints->enum->getAndReturnEnum(
    WeatherReport::Sunny->value,
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

**$request:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints HttpMethods
<details><summary><code>$client-&gt;endpoints-&gt;httpMethods-&gt;testGet($id) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->endpoints->httpMethods->testGet(
    'id',
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

<details><summary><code>$client-&gt;endpoints-&gt;httpMethods-&gt;testPost($request) -> ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->endpoints->httpMethods->testPost(
    new ObjectWithRequiredField([
        'string' => 'string',
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

**$request:** `ObjectWithRequiredField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;endpoints-&gt;httpMethods-&gt;testPut($id, $request) -> ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->endpoints->httpMethods->testPut(
    'id',
    new ObjectWithRequiredField([
        'string' => 'string',
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

**$id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$request:** `ObjectWithRequiredField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;endpoints-&gt;httpMethods-&gt;testPatch($id, $request) -> ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->endpoints->httpMethods->testPatch(
    'id',
    new ObjectWithOptionalField([
        'string' => 'string',
        'integer' => 1,
        'long' => 1000000,
        'double' => 1.1,
        'bool' => true,
        'datetime' => new DateTime('2024-01-15T09:30:00Z'),
        'date' => new DateTime('2023-01-15'),
        'uuid' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
        'base64' => 'SGVsbG8gd29ybGQh',
        'list' => [
            'list',
            'list',
        ],
        'set' => [
            'set',
        ],
        'map' => [
            1 => 'map',
        ],
        'bigint' => '1000000',
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

**$id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$request:** `ObjectWithOptionalField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;endpoints-&gt;httpMethods-&gt;testDelete($id) -> bool</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->endpoints->httpMethods->testDelete(
    'id',
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

## Endpoints Object
<details><summary><code>$client-&gt;endpoints-&gt;object-&gt;getAndReturnWithOptionalField($request) -> ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->endpoints->object->getAndReturnWithOptionalField(
    new ObjectWithOptionalField([
        'string' => 'string',
        'integer' => 1,
        'long' => 1000000,
        'double' => 1.1,
        'bool' => true,
        'datetime' => new DateTime('2024-01-15T09:30:00Z'),
        'date' => new DateTime('2023-01-15'),
        'uuid' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
        'base64' => 'SGVsbG8gd29ybGQh',
        'list' => [
            'list',
            'list',
        ],
        'set' => [
            'set',
        ],
        'map' => [
            1 => 'map',
        ],
        'bigint' => '1000000',
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

**$request:** `ObjectWithOptionalField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;endpoints-&gt;object-&gt;getAndReturnWithRequiredField($request) -> ObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->endpoints->object->getAndReturnWithRequiredField(
    new ObjectWithRequiredField([
        'string' => 'string',
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

**$request:** `ObjectWithRequiredField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;endpoints-&gt;object-&gt;getAndReturnWithMapOfMap($request) -> ObjectWithMapOfMap</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->endpoints->object->getAndReturnWithMapOfMap(
    new ObjectWithMapOfMap([
        'map' => [
            'map' => [
                'map' => 'map',
            ],
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

**$request:** `ObjectWithMapOfMap` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;endpoints-&gt;object-&gt;getAndReturnNestedWithOptionalField($request) -> NestedObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->endpoints->object->getAndReturnNestedWithOptionalField(
    new NestedObjectWithOptionalField([
        'string' => 'string',
        'nestedObject' => new ObjectWithOptionalField([
            'string' => 'string',
            'integer' => 1,
            'long' => 1000000,
            'double' => 1.1,
            'bool' => true,
            'datetime' => new DateTime('2024-01-15T09:30:00Z'),
            'date' => new DateTime('2023-01-15'),
            'uuid' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
            'base64' => 'SGVsbG8gd29ybGQh',
            'list' => [
                'list',
                'list',
            ],
            'set' => [
                'set',
            ],
            'map' => [
                1 => 'map',
            ],
            'bigint' => '1000000',
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

**$request:** `NestedObjectWithOptionalField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;endpoints-&gt;object-&gt;getAndReturnNestedWithRequiredField($string, $request) -> NestedObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->endpoints->object->getAndReturnNestedWithRequiredField(
    'string',
    new NestedObjectWithRequiredField([
        'string' => 'string',
        'nestedObject' => new ObjectWithOptionalField([
            'string' => 'string',
            'integer' => 1,
            'long' => 1000000,
            'double' => 1.1,
            'bool' => true,
            'datetime' => new DateTime('2024-01-15T09:30:00Z'),
            'date' => new DateTime('2023-01-15'),
            'uuid' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
            'base64' => 'SGVsbG8gd29ybGQh',
            'list' => [
                'list',
                'list',
            ],
            'set' => [
                'set',
            ],
            'map' => [
                1 => 'map',
            ],
            'bigint' => '1000000',
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

**$string:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$request:** `NestedObjectWithRequiredField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;endpoints-&gt;object-&gt;getAndReturnNestedWithRequiredFieldAsList($request) -> NestedObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->endpoints->object->getAndReturnNestedWithRequiredFieldAsList(
    [
        new NestedObjectWithRequiredField([
            'string' => 'string',
            'nestedObject' => new ObjectWithOptionalField([
                'string' => 'string',
                'integer' => 1,
                'long' => 1000000,
                'double' => 1.1,
                'bool' => true,
                'datetime' => new DateTime('2024-01-15T09:30:00Z'),
                'date' => new DateTime('2023-01-15'),
                'uuid' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
                'base64' => 'SGVsbG8gd29ybGQh',
                'list' => [
                    'list',
                    'list',
                ],
                'set' => [
                    'set',
                ],
                'map' => [
                    1 => 'map',
                ],
                'bigint' => '1000000',
            ]),
        ]),
        new NestedObjectWithRequiredField([
            'string' => 'string',
            'nestedObject' => new ObjectWithOptionalField([
                'string' => 'string',
                'integer' => 1,
                'long' => 1000000,
                'double' => 1.1,
                'bool' => true,
                'datetime' => new DateTime('2024-01-15T09:30:00Z'),
                'date' => new DateTime('2023-01-15'),
                'uuid' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
                'base64' => 'SGVsbG8gd29ybGQh',
                'list' => [
                    'list',
                    'list',
                ],
                'set' => [
                    'set',
                ],
                'map' => [
                    1 => 'map',
                ],
                'bigint' => '1000000',
            ]),
        ]),
    ],
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

**$request:** `array` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Params
<details><summary><code>$client-&gt;endpoints-&gt;params-&gt;getWithPath($param) -> string</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with path param
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->endpoints->params->getWithPath(
    'param',
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

**$param:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;endpoints-&gt;params-&gt;getWithInlinePath($param) -> string</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with path param
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->endpoints->params->getWithPath(
    'param',
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

**$param:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;endpoints-&gt;params-&gt;getWithQuery($request)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with query param
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->endpoints->params->getWithQuery(
    new GetWithQuery([
        'query' => 'query',
        'number' => 1,
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

**$query:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$number:** `int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;endpoints-&gt;params-&gt;getWithAllowMultipleQuery($request)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with multiple of same query param
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->endpoints->params->getWithQuery(
    new GetWithQuery([
        'query' => 'query',
        'number' => 1,
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

**$query:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$number:** `int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;endpoints-&gt;params-&gt;getWithPathAndQuery($param, $request)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with path and query params
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->endpoints->params->getWithPathAndQuery(
    'param',
    new GetWithPathAndQuery([
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

**$param:** `string` 
    
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

<details><summary><code>$client-&gt;endpoints-&gt;params-&gt;getWithInlinePathAndQuery($param, $request)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with path and query params
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->endpoints->params->getWithPathAndQuery(
    'param',
    new GetWithPathAndQuery([
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

**$param:** `string` 
    
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

<details><summary><code>$client-&gt;endpoints-&gt;params-&gt;modifyWithPath($param, $request) -> string</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

PUT to update with path param
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->endpoints->params->modifyWithPath(
    'param',
    'string',
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

**$param:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$request:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;endpoints-&gt;params-&gt;modifyWithInlinePath($param, $request) -> string</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

PUT to update with path param
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->endpoints->params->modifyWithPath(
    'param',
    'string',
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

**$param:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$request:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Primitive
<details><summary><code>$client-&gt;endpoints-&gt;primitive-&gt;getAndReturnString($request) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->endpoints->primitive->getAndReturnString(
    'string',
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

**$request:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;endpoints-&gt;primitive-&gt;getAndReturnInt($request) -> int</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->endpoints->primitive->getAndReturnInt(
    1,
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

**$request:** `int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;endpoints-&gt;primitive-&gt;getAndReturnLong($request) -> int</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->endpoints->primitive->getAndReturnLong(
    1000000,
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

**$request:** `int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;endpoints-&gt;primitive-&gt;getAndReturnDouble($request) -> float</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->endpoints->primitive->getAndReturnDouble(
    1.1,
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

**$request:** `float` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;endpoints-&gt;primitive-&gt;getAndReturnBool($request) -> bool</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->endpoints->primitive->getAndReturnBool(
    true,
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

**$request:** `bool` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;endpoints-&gt;primitive-&gt;getAndReturnDatetime($request) -> DateTime</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->endpoints->primitive->getAndReturnDatetime(
    new DateTime('2024-01-15T09:30:00Z'),
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

**$request:** `DateTime` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;endpoints-&gt;primitive-&gt;getAndReturnDate($request) -> DateTime</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->endpoints->primitive->getAndReturnDate(
    new DateTime('2023-01-15'),
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

**$request:** `DateTime` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;endpoints-&gt;primitive-&gt;getAndReturnUuid($request) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->endpoints->primitive->getAndReturnUuid(
    'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
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

**$request:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;endpoints-&gt;primitive-&gt;getAndReturnBase64($request) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->endpoints->primitive->getAndReturnBase64(
    'SGVsbG8gd29ybGQh',
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

**$request:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Put
<details><summary><code>$client-&gt;endpoints-&gt;put-&gt;add($id) -> PutResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->endpoints->put->add(
    'id',
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

## Endpoints Union
<details><summary><code>$client-&gt;endpoints-&gt;union-&gt;getAndReturnUnion($request) -> Animal</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->endpoints->union->getAndReturnUnion(
    Animal::dog(new Dog([
        'name' => 'name',
        'likesToWoof' => true,
    ])),
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

**$request:** `Animal` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Urls
<details><summary><code>$client-&gt;endpoints-&gt;urls-&gt;withMixedCase() -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->endpoints->urls->withMixedCase();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;endpoints-&gt;urls-&gt;noEndingSlash() -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->endpoints->urls->noEndingSlash();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;endpoints-&gt;urls-&gt;withEndingSlash() -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->endpoints->urls->withEndingSlash();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;endpoints-&gt;urls-&gt;withUnderscores() -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->endpoints->urls->withUnderscores();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## InlinedRequests
<details><summary><code>$client-&gt;inlinedRequests-&gt;postWithObjectBodyandResponse($request) -> ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

POST with custom object in request body, response is an object
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->inlinedRequests->postWithObjectBodyandResponse(
    new PostWithObjectBody([
        'string' => 'string',
        'integer' => 1,
        'nestedObject' => new ObjectWithOptionalField([
            'string' => 'string',
            'integer' => 1,
            'long' => 1000000,
            'double' => 1.1,
            'bool' => true,
            'datetime' => new DateTime('2024-01-15T09:30:00Z'),
            'date' => new DateTime('2023-01-15'),
            'uuid' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
            'base64' => 'SGVsbG8gd29ybGQh',
            'list' => [
                'list',
                'list',
            ],
            'set' => [
                'set',
            ],
            'map' => [
                1 => 'map',
            ],
            'bigint' => '1000000',
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

**$string:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$integer:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**$nestedObject:** `ObjectWithOptionalField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## NoAuth
<details><summary><code>$client-&gt;noAuth-&gt;postWithNoAuth($request) -> bool</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

POST request with no auth
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->noAuth->postWithNoAuth(
    [
        'key' => "value",
    ],
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

**$request:** `mixed` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## NoReqBody
<details><summary><code>$client-&gt;noReqBody-&gt;getWithNoRequestBody() -> ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->noReqBody->getWithNoRequestBody();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;noReqBody-&gt;postWithNoRequestBody() -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->noReqBody->postWithNoRequestBody();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## ReqWithHeaders
<details><summary><code>$client-&gt;reqWithHeaders-&gt;getWithCustomHeader($request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->reqWithHeaders->getWithCustomHeader(
    new ReqWithHeaders([
        'xTestServiceHeader' => 'X-TEST-SERVICE-HEADER',
        'xTestEndpointHeader' => 'X-TEST-ENDPOINT-HEADER',
        'body' => 'string',
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

**$xTestEndpointHeader:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$request:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
