# Reference
<details><summary><code>$client->echo_($request) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->echo_(
    'Hello world!\n\nwith\n\tnewlines',
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

<details><summary><code>$client->createType($request) -> Identifier</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->echo_(
    'primitive',
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

## File Notification Service
<details><summary><code>$client->file->notification->service->getException($notificationId) -> Exception</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->file->notification->service->getException(
    'notification-hsy129x',
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

**$notificationId:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## File Service
<details><summary><code>$client->file->service->getFile($filename, $request) -> File</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

This endpoint returns a file by its name.
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
$client->file->service->getFile(
    'file.txt',
    new GetFileRequest([
        'xFileApiVersion' => '0.0.2',
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

**$filename:** `string` — This is a filename
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Health Service
<details><summary><code>$client->health->service->check($id)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

This endpoint checks the health of a resource.
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
$client->health->service->check(
    'id-2sdx82h',
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

**$id:** `string` — The id to check
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->health->service->ping() -> bool</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

This endpoint checks the health of the service.
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
$client->health->service->ping();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Service
<details><summary><code>$client->service->getMovie($movieId) -> Movie</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->service->getMovie(
    'movie-c06a4ad7',
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

**$movieId:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->service->createMovie($request) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->service->createMovie(
    new Movie([
        'id' => 'movie-c06a4ad7',
        'prequel' => 'movie-cv9b914f',
        'title' => 'The Boy and the Heron',
        'from' => 'Hayao Miyazaki',
        'rating' => 8,
        'type' => 'movie',
        'tag' => 'tag-wf9as23d',
        'metadata' => [
            'actors' => [
                "Christian Bale",
                "Florence Pugh",
                "Willem Dafoe",
            ],
            'releaseDate' => "2023-12-08",
            'ratings' => [
                'rottenTomatoes' => 97,
                'imdb' => 7.6,
            ],
        ],
        'revenue' => 1000000,
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

**$request:** `Movie` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->service->getMetadata($request) -> Metadata</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->service->getMetadata(
    new GetMetadataRequest([
        'shallow' => false,
        'tag' => [
            'development',
        ],
        'xApiVersion' => '0.0.1',
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

**$shallow:** `?bool` 
    
</dd>
</dl>

<dl>
<dd>

**$tag:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$xApiVersion:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->service->createBigEntity($request) -> Response</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->service->createBigEntity(
    new BigEntity([
        'castMember' => new Actor([
            'name' => 'name',
            'id' => 'id',
        ]),
        'extendedMovie' => new ExtendedMovie([
            'cast' => [
                'cast',
                'cast',
            ],
            'id' => 'id',
            'prequel' => 'prequel',
            'title' => 'title',
            'from' => 'from',
            'rating' => 1.1,
            'type' => 'movie',
            'tag' => 'tag',
            'book' => 'book',
            'metadata' => [
                'metadata' => [
                    'key' => "value",
                ],
            ],
            'revenue' => 1000000,
        ]),
        'entity' => new Entity([
            'type' => BasicType::Primitive->value,
            'name' => 'name',
        ]),
        'metadata' => Metadata::html([
            'extra' => 'extra',
        ], [
            'tags',
        ]),
        'commonMetadata' => new \Seed\Commons\Types\Types\Metadata([
            'id' => 'id',
            'data' => [
                'data' => 'data',
            ],
            'jsonString' => 'jsonString',
        ]),
        'eventInfo' => EventInfo::metadata(new \Seed\Commons\Types\Types\Metadata([
            'id' => 'id',
            'data' => [
                'data' => 'data',
            ],
            'jsonString' => 'jsonString',
        ])),
        'data' => Data::string(),
        'migration' => new Migration([
            'name' => 'name',
            'status' => MigrationStatus::Running->value,
        ]),
        'exception' => Exception::generic(new ExceptionInfo([
            'exceptionType' => 'exceptionType',
            'exceptionMessage' => 'exceptionMessage',
            'exceptionStacktrace' => 'exceptionStacktrace',
        ])),
        'test' => Test::and_(),
        'node' => new Node([
            'name' => 'name',
            'nodes' => [
                new Node([
                    'name' => 'name',
                    'nodes' => [
                        new Node([
                            'name' => 'name',
                            'nodes' => [],
                            'trees' => [],
                        ]),
                        new Node([
                            'name' => 'name',
                            'nodes' => [],
                            'trees' => [],
                        ]),
                    ],
                    'trees' => [
                        new Tree([
                            'nodes' => [],
                        ]),
                        new Tree([
                            'nodes' => [],
                        ]),
                    ],
                ]),
                new Node([
                    'name' => 'name',
                    'nodes' => [
                        new Node([
                            'name' => 'name',
                            'nodes' => [],
                            'trees' => [],
                        ]),
                        new Node([
                            'name' => 'name',
                            'nodes' => [],
                            'trees' => [],
                        ]),
                    ],
                    'trees' => [
                        new Tree([
                            'nodes' => [],
                        ]),
                        new Tree([
                            'nodes' => [],
                        ]),
                    ],
                ]),
            ],
            'trees' => [
                new Tree([
                    'nodes' => [
                        new Node([
                            'name' => 'name',
                            'nodes' => [],
                            'trees' => [],
                        ]),
                        new Node([
                            'name' => 'name',
                            'nodes' => [],
                            'trees' => [],
                        ]),
                    ],
                ]),
                new Tree([
                    'nodes' => [
                        new Node([
                            'name' => 'name',
                            'nodes' => [],
                            'trees' => [],
                        ]),
                        new Node([
                            'name' => 'name',
                            'nodes' => [],
                            'trees' => [],
                        ]),
                    ],
                ]),
            ],
        ]),
        'directory' => new Directory([
            'name' => 'name',
            'files' => [
                new File([
                    'name' => 'name',
                    'contents' => 'contents',
                ]),
                new File([
                    'name' => 'name',
                    'contents' => 'contents',
                ]),
            ],
            'directories' => [
                new Directory([
                    'name' => 'name',
                    'files' => [
                        new File([
                            'name' => 'name',
                            'contents' => 'contents',
                        ]),
                        new File([
                            'name' => 'name',
                            'contents' => 'contents',
                        ]),
                    ],
                    'directories' => [
                        new Directory([
                            'name' => 'name',
                            'files' => [],
                            'directories' => [],
                        ]),
                        new Directory([
                            'name' => 'name',
                            'files' => [],
                            'directories' => [],
                        ]),
                    ],
                ]),
                new Directory([
                    'name' => 'name',
                    'files' => [
                        new File([
                            'name' => 'name',
                            'contents' => 'contents',
                        ]),
                        new File([
                            'name' => 'name',
                            'contents' => 'contents',
                        ]),
                    ],
                    'directories' => [
                        new Directory([
                            'name' => 'name',
                            'files' => [],
                            'directories' => [],
                        ]),
                        new Directory([
                            'name' => 'name',
                            'files' => [],
                            'directories' => [],
                        ]),
                    ],
                ]),
            ],
        ]),
        'moment' => new Moment([
            'id' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
            'date' => new DateTime('2023-01-15'),
            'datetime' => new DateTime('2024-01-15T09:30:00Z'),
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

**$request:** `BigEntity` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->service->refreshToken($request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->service->refreshToken(
    ,
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

**$request:** `?RefreshTokenRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
