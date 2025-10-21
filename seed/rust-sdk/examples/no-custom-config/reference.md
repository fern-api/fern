# Reference
<details><summary><code>client.<a href="/src/client.rs">echo</a>(request: String) -> Result<String, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_examples::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExamplesClient::new(config).expect("Failed to build client");
    client
        .echo(&"Hello world!\\n\\nwith\\n\\tnewlines".to_string(), None)
        .await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/src/client.rs">create_type</a>(request: Type) -> Result<Identifier, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_examples::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExamplesClient::new(config).expect("Failed to build client");
    client.echo(&"primitive".to_string(), None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## File Notification Service
<details><summary><code>client.file().notification().service.<a href="/src/api/resources/file/notification/service/client.rs">get_exception</a>(notification_id: String) -> Result<Exception, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_examples::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExamplesClient::new(config).expect("Failed to build client");
    client
        .file
        .notification
        .service
        .get_exception(&"notification-hsy129x".to_string(), None)
        .await;
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

**notification_id:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## File Service
<details><summary><code>client.file().service.<a href="/src/api/resources/file/service/client.rs">get_file</a>(filename: String) -> Result<File, ApiError></code></summary>
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

```rust
use seed_examples::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExamplesClient::new(config).expect("Failed to build client");
    client
        .file
        .service
        .get_file(&"file.txt".to_string(), None)
        .await;
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

**filename:** `String` — This is a filename
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Health Service
<details><summary><code>client.health().service.<a href="/src/api/resources/health/service/client.rs">check</a>(id: String) -> Result<(), ApiError></code></summary>
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

```rust
use seed_examples::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExamplesClient::new(config).expect("Failed to build client");
    client
        .health
        .service
        .check(&"id-2sdx82h".to_string(), None)
        .await;
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

**id:** `String` — The id to check
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.health().service.<a href="/src/api/resources/health/service/client.rs">ping</a>() -> Result<bool, ApiError></code></summary>
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

```rust
use seed_examples::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExamplesClient::new(config).expect("Failed to build client");
    client.health.service.ping(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Service
<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">get_movie</a>(movie_id: MovieId) -> Result<Movie, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_examples::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExamplesClient::new(config).expect("Failed to build client");
    client
        .service
        .get_movie(&MovieId("movie-c06a4ad7".to_string()), None)
        .await;
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

**movie_id:** `MovieId` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">create_movie</a>(request: Movie) -> Result<MovieId, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_examples::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExamplesClient::new(config).expect("Failed to build client");
    client
        .service
        .create_movie(
            &Movie {
                id: MovieId("movie-c06a4ad7".to_string()),
                prequel: Some(MovieId("movie-cv9b914f".to_string())),
                title: "The Boy and the Heron".to_string(),
                from: "Hayao Miyazaki".to_string(),
                rating: 8,
                r#type: "movie".to_string(),
                tag: Tag("tag-wf9as23d".to_string()),
                metadata: HashMap::from([
                    (
                        "actors".to_string(),
                        vec![
                            "Christian Bale".to_string(),
                            "Florence Pugh".to_string(),
                            "Willem Dafoe".to_string(),
                        ],
                    ),
                    ("releaseDate".to_string(), "2023-12-08".to_string()),
                    (
                        "ratings".to_string(),
                        serde_json::json!({"rottenTomatoes":97,"imdb":7.6}),
                    ),
                ]),
                revenue: 1000000,
            },
            None,
        )
        .await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">get_metadata</a>(shallow: Option<Option<bool>>) -> Result<Metadata, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_examples::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExamplesClient::new(config).expect("Failed to build client");
    client
        .service
        .get_metadata(
            &GetMetadataQueryRequest {
                shallow: Some(false),
                tag: vec![Some("development".to_string())],
                x_api_version: "0.0.1".to_string(),
            },
            None,
        )
        .await;
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

**shallow:** `Option<bool>` 
    
</dd>
</dl>

<dl>
<dd>

**tag:** `Option<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">create_big_entity</a>(request: BigEntity) -> Result<Response, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_examples::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExamplesClient::new(config).expect("Failed to build client");
    client
        .service
        .create_big_entity(
            &BigEntity {
                cast_member: Some(CastMember::Actor(Actor {
                    name: "name".to_string(),
                    id: "id".to_string(),
                })),
                extended_movie: Some(ExtendedMovie {
                    cast: vec!["cast".to_string(), "cast".to_string()],
                    id: MovieId("id".to_string()),
                    prequel: Some(MovieId("prequel".to_string())),
                    title: "title".to_string(),
                    from: "from".to_string(),
                    rating: 1.1,
                    r#type: "movie".to_string(),
                    tag: Tag("tag".to_string()),
                    book: Some("book".to_string()),
                    metadata: HashMap::from([(
                        "metadata".to_string(),
                        serde_json::json!({"key":"value"}),
                    )]),
                    revenue: 1000000,
                }),
                entity: Some(Entity {
                    r#type: Type::BasicType(BasicType::Primitive),
                    name: "name".to_string(),
                }),
                metadata: Some(Metadata::Html { value: None }),
                common_metadata: Some(Metadata {
                    id: "id".to_string(),
                    data: Some(HashMap::from([("data".to_string(), "data".to_string())])),
                    json_string: Some("jsonString".to_string()),
                }),
                event_info: Some(EventInfo::Metadata {
                    data: Metadata {
                        id: "id".to_string(),
                        data: Some(HashMap::from([("data".to_string(), "data".to_string())])),
                        json_string: Some("jsonString".to_string()),
                    },
                }),
                data: Some(Data::String_ { value: None }),
                migration: Some(Migration {
                    name: "name".to_string(),
                    status: MigrationStatus::Running,
                }),
                exception: Some(Exception::Generic {
                    data: ExceptionInfo {
                        exception_type: "exceptionType".to_string(),
                        exception_message: "exceptionMessage".to_string(),
                        exception_stacktrace: "exceptionStacktrace".to_string(),
                    },
                }),
                test: Some(Test::And { value: None }),
                node: Some(Node {
                    name: "name".to_string(),
                    nodes: Some(vec![
                        Node {
                            name: "name".to_string(),
                            nodes: Some(vec![
                                Node {
                                    name: "name".to_string(),
                                    nodes: Some(vec![]),
                                    trees: Some(vec![]),
                                },
                                Node {
                                    name: "name".to_string(),
                                    nodes: Some(vec![]),
                                    trees: Some(vec![]),
                                },
                            ]),
                            trees: Some(vec![
                                Tree {
                                    nodes: Some(vec![]),
                                },
                                Tree {
                                    nodes: Some(vec![]),
                                },
                            ]),
                        },
                        Node {
                            name: "name".to_string(),
                            nodes: Some(vec![
                                Node {
                                    name: "name".to_string(),
                                    nodes: Some(vec![]),
                                    trees: Some(vec![]),
                                },
                                Node {
                                    name: "name".to_string(),
                                    nodes: Some(vec![]),
                                    trees: Some(vec![]),
                                },
                            ]),
                            trees: Some(vec![
                                Tree {
                                    nodes: Some(vec![]),
                                },
                                Tree {
                                    nodes: Some(vec![]),
                                },
                            ]),
                        },
                    ]),
                    trees: Some(vec![
                        Tree {
                            nodes: Some(vec![
                                Node {
                                    name: "name".to_string(),
                                    nodes: Some(vec![]),
                                    trees: Some(vec![]),
                                },
                                Node {
                                    name: "name".to_string(),
                                    nodes: Some(vec![]),
                                    trees: Some(vec![]),
                                },
                            ]),
                        },
                        Tree {
                            nodes: Some(vec![
                                Node {
                                    name: "name".to_string(),
                                    nodes: Some(vec![]),
                                    trees: Some(vec![]),
                                },
                                Node {
                                    name: "name".to_string(),
                                    nodes: Some(vec![]),
                                    trees: Some(vec![]),
                                },
                            ]),
                        },
                    ]),
                }),
                directory: Some(Directory {
                    name: "name".to_string(),
                    files: Some(vec![
                        File {
                            name: "name".to_string(),
                            contents: "contents".to_string(),
                        },
                        File {
                            name: "name".to_string(),
                            contents: "contents".to_string(),
                        },
                    ]),
                    directories: Some(vec![
                        Directory {
                            name: "name".to_string(),
                            files: Some(vec![
                                File {
                                    name: "name".to_string(),
                                    contents: "contents".to_string(),
                                },
                                File {
                                    name: "name".to_string(),
                                    contents: "contents".to_string(),
                                },
                            ]),
                            directories: Some(vec![
                                Directory {
                                    name: "name".to_string(),
                                    files: Some(vec![]),
                                    directories: Some(vec![]),
                                },
                                Directory {
                                    name: "name".to_string(),
                                    files: Some(vec![]),
                                    directories: Some(vec![]),
                                },
                            ]),
                        },
                        Directory {
                            name: "name".to_string(),
                            files: Some(vec![
                                File {
                                    name: "name".to_string(),
                                    contents: "contents".to_string(),
                                },
                                File {
                                    name: "name".to_string(),
                                    contents: "contents".to_string(),
                                },
                            ]),
                            directories: Some(vec![
                                Directory {
                                    name: "name".to_string(),
                                    files: Some(vec![]),
                                    directories: Some(vec![]),
                                },
                                Directory {
                                    name: "name".to_string(),
                                    files: Some(vec![]),
                                    directories: Some(vec![]),
                                },
                            ]),
                        },
                    ]),
                }),
                moment: Some(Moment {
                    id: Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap(),
                    date: NaiveDate::parse_from_str("2023-01-15", "%Y-%m-%d").unwrap(),
                    datetime: DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z")
                        .unwrap()
                        .with_timezone(&Utc),
                }),
            },
            None,
        )
        .await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">refresh_token</a>(request: Option<RefreshTokenRequest>) -> Result<(), ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_examples::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExamplesClient::new(config).expect("Failed to build client");
    client.service.refresh_token(&None, None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
