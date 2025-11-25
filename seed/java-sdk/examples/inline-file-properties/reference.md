# Reference
<details><summary><code>client.echo(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.echo("Hello world!\\n\\nwith\\n\\tnewlines");
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

**request:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.createType(request) -> Identifier</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.echo("primitive");
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

**request:** `Type` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## File Notification Service
<details><summary><code>client.file.notification.service.getException(notificationId) -> Exception</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.file().notification().service().getException("notification-hsy129x");
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

**notificationId:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## File Service
<details><summary><code>client.file.service.getFile(filename) -> File</code></summary>
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

```java
client.file().service().getFile(
    "file.txt",
    GetFileRequest
        .builder()
        .xFileApiVersion("0.0.2")
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

**filename:** `String` — This is a filename
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Health Service
<details><summary><code>client.health.service.check(id)</code></summary>
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

```java
client.health().service().check("id-2sdx82h");
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

**id:** `String` — The id to check
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.health.service.ping() -> Boolean</code></summary>
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

```java
client.health().service().ping();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Service
<details><summary><code>client.service.getMovie(movieId) -> Movie</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.service().getMovie("movie-c06a4ad7");
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

**movieId:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.createMovie(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.service().createMovie(
    Movie
        .builder()
        .id("movie-c06a4ad7")
        .title("The Boy and the Heron")
        .from("Hayao Miyazaki")
        .rating(8.0)
        .tag("tag-wf9as23d")
        .revenue(1000000L)
        .prequel("movie-cv9b914f")
        .metadata(
            new HashMap<String, Object>() {{
                put("actors", new ArrayList<Object>(Arrays.asList("Christian Bale", "Florence Pugh", "Willem Dafoe")));
                put("releaseDate", "2023-12-08");
                put("ratings", new 
                HashMap<String, Object>() {{put("rottenTomatoes", 97);
                    put("imdb", 7.6);
                }});
            }}
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

**request:** `Movie` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.getMetadata() -> Metadata</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.service().getMetadata(
    GetMetadataRequest
        .builder()
        .xApiVersion("0.0.1")
        .tag(
            Arrays.asList(Optional.of("development"))
        )
        .shallow(false)
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

**shallow:** `Optional<Boolean>` 
    
</dd>
</dl>

<dl>
<dd>

**tag:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**xApiVersion:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.createBigEntity(request) -> Response</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.service().createBigEntity(
    BigEntity
        .builder()
        .castMember(
            CastMember.of(
                Actor
                    .builder()
                    .name("name")
                    .id("id")
                    .build()
            )
        )
        .extendedMovie(
            ExtendedMovie
                .builder()
                .id("id")
                .title("title")
                .from("from")
                .rating(1.1)
                .tag("tag")
                .revenue(1000000L)
                .prequel("prequel")
                .book("book")
                .metadata(
                    new HashMap<String, Object>() {{
                        put("metadata", new 
                        HashMap<String, Object>() {{put("key", "value");
                        }});
                    }}
                )
                .cast(
                    Arrays.asList("cast", "cast")
                )
                .build()
        )
        .entity(
            Entity
                .builder()
                .type(
                    Type.of(BasicType.PRIMITIVE)
                )
                .name("name")
                .build()
        )
        .metadata(
            Metadata.html("metadata")
        )
        .commonMetadata(
            Metadata
                .builder()
                .id("id")
                .data(
                    new HashMap<String, String>() {{
                        put("data", "data");
                    }}
                )
                .jsonString("jsonString")
                .build()
        )
        .eventInfo(
            EventInfo.metadata(
                Metadata
                    .builder()
                    .id("id")
                    .data(
                        new HashMap<String, String>() {{
                            put("data", "data");
                        }}
                    )
                    .jsonString("jsonString")
                    .build()
            )
        )
        .data(
            Data.string("data")
        )
        .migration(
            Migration
                .builder()
                .name("name")
                .status(MigrationStatus.RUNNING)
                .build()
        )
        .exception(
            Exception.generic(
                ExceptionInfo
                    .builder()
                    .exceptionType("exceptionType")
                    .exceptionMessage("exceptionMessage")
                    .exceptionStacktrace("exceptionStacktrace")
                    .build()
            )
        )
        .test(
            Test.and(true)
        )
        .node(
            Node
                .builder()
                .name("name")
                .nodes(
                    Optional.of(
                        Arrays.asList(
                            Node
                                .builder()
                                .name("name")
                                .nodes(
                                    Optional.of(
                                        Arrays.asList(
                                            Node
                                                .builder()
                                                .name("name")
                                                .nodes(
                                                    Optional.of(
                                                        new ArrayList<Node>()
                                                    )
                                                )
                                                .trees(
                                                    Optional.of(
                                                        new ArrayList<Tree>()
                                                    )
                                                )
                                                .build(),
                                            Node
                                                .builder()
                                                .name("name")
                                                .nodes(
                                                    Optional.of(
                                                        new ArrayList<Node>()
                                                    )
                                                )
                                                .trees(
                                                    Optional.of(
                                                        new ArrayList<Tree>()
                                                    )
                                                )
                                                .build()
                                        )
                                    )
                                )
                                .trees(
                                    Optional.of(
                                        Arrays.asList(
                                            Tree
                                                .builder()
                                                .nodes(
                                                    Optional.of(
                                                        new ArrayList<Node>()
                                                    )
                                                )
                                                .build(),
                                            Tree
                                                .builder()
                                                .nodes(
                                                    Optional.of(
                                                        new ArrayList<Node>()
                                                    )
                                                )
                                                .build()
                                        )
                                    )
                                )
                                .build(),
                            Node
                                .builder()
                                .name("name")
                                .nodes(
                                    Optional.of(
                                        Arrays.asList(
                                            Node
                                                .builder()
                                                .name("name")
                                                .nodes(
                                                    Optional.of(
                                                        new ArrayList<Node>()
                                                    )
                                                )
                                                .trees(
                                                    Optional.of(
                                                        new ArrayList<Tree>()
                                                    )
                                                )
                                                .build(),
                                            Node
                                                .builder()
                                                .name("name")
                                                .nodes(
                                                    Optional.of(
                                                        new ArrayList<Node>()
                                                    )
                                                )
                                                .trees(
                                                    Optional.of(
                                                        new ArrayList<Tree>()
                                                    )
                                                )
                                                .build()
                                        )
                                    )
                                )
                                .trees(
                                    Optional.of(
                                        Arrays.asList(
                                            Tree
                                                .builder()
                                                .nodes(
                                                    Optional.of(
                                                        new ArrayList<Node>()
                                                    )
                                                )
                                                .build(),
                                            Tree
                                                .builder()
                                                .nodes(
                                                    Optional.of(
                                                        new ArrayList<Node>()
                                                    )
                                                )
                                                .build()
                                        )
                                    )
                                )
                                .build()
                        )
                    )
                )
                .trees(
                    Optional.of(
                        Arrays.asList(
                            Tree
                                .builder()
                                .nodes(
                                    Optional.of(
                                        Arrays.asList(
                                            Node
                                                .builder()
                                                .name("name")
                                                .nodes(
                                                    Optional.of(
                                                        new ArrayList<Node>()
                                                    )
                                                )
                                                .trees(
                                                    Optional.of(
                                                        new ArrayList<Tree>()
                                                    )
                                                )
                                                .build(),
                                            Node
                                                .builder()
                                                .name("name")
                                                .nodes(
                                                    Optional.of(
                                                        new ArrayList<Node>()
                                                    )
                                                )
                                                .trees(
                                                    Optional.of(
                                                        new ArrayList<Tree>()
                                                    )
                                                )
                                                .build()
                                        )
                                    )
                                )
                                .build(),
                            Tree
                                .builder()
                                .nodes(
                                    Optional.of(
                                        Arrays.asList(
                                            Node
                                                .builder()
                                                .name("name")
                                                .nodes(
                                                    Optional.of(
                                                        new ArrayList<Node>()
                                                    )
                                                )
                                                .trees(
                                                    Optional.of(
                                                        new ArrayList<Tree>()
                                                    )
                                                )
                                                .build(),
                                            Node
                                                .builder()
                                                .name("name")
                                                .nodes(
                                                    Optional.of(
                                                        new ArrayList<Node>()
                                                    )
                                                )
                                                .trees(
                                                    Optional.of(
                                                        new ArrayList<Tree>()
                                                    )
                                                )
                                                .build()
                                        )
                                    )
                                )
                                .build()
                        )
                    )
                )
                .build()
        )
        .directory(
            Directory
                .builder()
                .name("name")
                .files(
                    Optional.of(
                        Arrays.asList(
                            File
                                .builder()
                                .name("name")
                                .contents("contents")
                                .build(),
                            File
                                .builder()
                                .name("name")
                                .contents("contents")
                                .build()
                        )
                    )
                )
                .directories(
                    Optional.of(
                        Arrays.asList(
                            Directory
                                .builder()
                                .name("name")
                                .files(
                                    Optional.of(
                                        Arrays.asList(
                                            File
                                                .builder()
                                                .name("name")
                                                .contents("contents")
                                                .build(),
                                            File
                                                .builder()
                                                .name("name")
                                                .contents("contents")
                                                .build()
                                        )
                                    )
                                )
                                .directories(
                                    Optional.of(
                                        Arrays.asList(
                                            Directory
                                                .builder()
                                                .name("name")
                                                .files(
                                                    Optional.of(
                                                        new ArrayList<File>()
                                                    )
                                                )
                                                .directories(
                                                    Optional.of(
                                                        new ArrayList<Directory>()
                                                    )
                                                )
                                                .build(),
                                            Directory
                                                .builder()
                                                .name("name")
                                                .files(
                                                    Optional.of(
                                                        new ArrayList<File>()
                                                    )
                                                )
                                                .directories(
                                                    Optional.of(
                                                        new ArrayList<Directory>()
                                                    )
                                                )
                                                .build()
                                        )
                                    )
                                )
                                .build(),
                            Directory
                                .builder()
                                .name("name")
                                .files(
                                    Optional.of(
                                        Arrays.asList(
                                            File
                                                .builder()
                                                .name("name")
                                                .contents("contents")
                                                .build(),
                                            File
                                                .builder()
                                                .name("name")
                                                .contents("contents")
                                                .build()
                                        )
                                    )
                                )
                                .directories(
                                    Optional.of(
                                        Arrays.asList(
                                            Directory
                                                .builder()
                                                .name("name")
                                                .files(
                                                    Optional.of(
                                                        new ArrayList<File>()
                                                    )
                                                )
                                                .directories(
                                                    Optional.of(
                                                        new ArrayList<Directory>()
                                                    )
                                                )
                                                .build(),
                                            Directory
                                                .builder()
                                                .name("name")
                                                .files(
                                                    Optional.of(
                                                        new ArrayList<File>()
                                                    )
                                                )
                                                .directories(
                                                    Optional.of(
                                                        new ArrayList<Directory>()
                                                    )
                                                )
                                                .build()
                                        )
                                    )
                                )
                                .build()
                        )
                    )
                )
                .build()
        )
        .moment(
            Moment
                .builder()
                .id(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
                .date("2023-01-15")
                .datetime(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                .build()
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

**request:** `BigEntity` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.refreshToken(request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.service().refreshToken(
    Optional.empty()
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

**request:** `Optional<RefreshTokenRequest>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
