# Reference
## 
<details><summary><code>client.<a href="/src/api/resources//client.rs">echo</a>(request: String) -> Result&lt;String, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client..echo(&"string".to_string(), None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/src/api/resources//client.rs">create_type</a>(request: Type) -> Result&lt;Identifier, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client..create_type(&Type::BasicType(BasicType::Primitive), None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## FileNotificationService
<details><summary><code>client.file_notification_service.<a href="/src/api/resources/file_notification_service/client.rs">file_notification_service_get_exception</a>(notification_id: String) -> Result&lt;Exception, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .file_notification_service
        .file_notification_service_get_exception(&"notificationId".to_string(), None)
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

## FileService
<details><summary><code>client.file_service.<a href="/src/api/resources/file_service/client.rs">file_service_get_file</a>(filename: String) -> Result&lt;File, ApiError&gt;</code></summary>
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
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .file_service
        .file_service_get_file(&"filename".to_string(), None)
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

## HealthService
<details><summary><code>client.health_service.<a href="/src/api/resources/health_service/client.rs">health_service_check</a>(id: String) -> Result&lt;(), ApiError&gt;</code></summary>
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
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .health_service
        .health_service_check(&"id".to_string(), None)
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

<details><summary><code>client.health_service.<a href="/src/api/resources/health_service/client.rs">health_service_ping</a>() -> Result&lt;bool, ApiError&gt;</code></summary>
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
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client.health_service.health_service_ping(None).await;
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
<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">getmovie</a>(movie_id: MovieId) -> Result&lt;Movie, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .service
        .getmovie(&MovieId("movieId".to_string()), None)
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

<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">createmovie</a>(request: Movie) -> Result&lt;MovieId, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .service
        .createmovie(
            &Movie {
                id: MovieId("id".to_string()),
                prequel: None,
                title: "title".to_string(),
                from: "from".to_string(),
                rating: 1.1,
                r#type: MovieType::Movie,
                tag: CommonsTag("tag".to_string()),
                book: None,
                metadata: HashMap::from([("key".to_string(), serde_json::json!("value"))]),
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

<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">getmetadata</a>(shallow: Option&lt;Option&lt;Option&lt;bool&gt;&gt;&gt;) -> Result&lt;Metadata, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .service
        .getmetadata(
            &GetmetadataQueryRequest {
                shallow: None,
                tag: vec![],
            },
            Some(RequestOptions::new().additional_header("X-API-Version", "X-API-Version")),
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

**shallow:** `Option<Option<bool>>` 
    
</dd>
</dl>

<dl>
<dd>

**tag:** `Option<Option<String>>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">createbigentity</a>(request: BigEntity) -> Result&lt;Response, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .service
        .createbigentity(
            &BigEntity {
                ..Default::default()
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

**cast_member:** `Option<CastMember>` 
    
</dd>
</dl>

<dl>
<dd>

**extended_movie:** `Option<ExtendedMovie>` 
    
</dd>
</dl>

<dl>
<dd>

**entity:** `Option<Entity>` 
    
</dd>
</dl>

<dl>
<dd>

**metadata:** `Option<Metadata>` 
    
</dd>
</dl>

<dl>
<dd>

**common_metadata:** `Option<CommonsMetadata>` 
    
</dd>
</dl>

<dl>
<dd>

**event_info:** `Option<CommonsEventInfo>` 
    
</dd>
</dl>

<dl>
<dd>

**data:** `Option<CommonsData>` 
    
</dd>
</dl>

<dl>
<dd>

**migration:** `Option<Migration>` 
    
</dd>
</dl>

<dl>
<dd>

**exception:** `Option<Exception>` 
    
</dd>
</dl>

<dl>
<dd>

**test:** `Option<Test>` 
    
</dd>
</dl>

<dl>
<dd>

**node:** `Option<Node>` 
    
</dd>
</dl>

<dl>
<dd>

**directory:** `Option<Directory>` 
    
</dd>
</dl>

<dl>
<dd>

**moment:** `Option<Moment>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">refreshtoken</a>(request: RefreshTokenRequest) -> Result&lt;(), ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .service
        .refreshtoken(&RefreshTokenRequest { ttl: 1 }, None)
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

**ttl:** `i64` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

