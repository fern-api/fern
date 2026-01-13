# Reference
## Imdb
<details><summary><code>client.imdb.<a href="/src/api/resources/imdb/client.rs">create_movie</a>(request: CreateMovieRequest) -> Result&lt;MovieId, ApiError&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Add a movie to the database using the movies/* /... path.
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
use custom_imdb_sdk::prelude::*;
use custom_imdb_sdk::CreateMovieRequest;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = CustomImdbClient::new(config).expect("Failed to build client");
    client
        .imdb
        .create_movie(
            &CreateMovieRequest {
                title: "title".to_string(),
                rating: 1.1,
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

<details><summary><code>client.imdb.<a href="/src/api/resources/imdb/client.rs">get_movie</a>(movie_id: MovieId) -> Result&lt;Movie, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use custom_imdb_sdk::prelude::*;
use custom_imdb_sdk::MovieId;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = CustomImdbClient::new(config).expect("Failed to build client");
    client
        .imdb
        .get_movie(&MovieId("movieId".to_string()), None)
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
