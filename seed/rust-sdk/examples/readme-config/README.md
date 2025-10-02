# Seed Rust Library

![](https://www.fernapi.com)

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=Seed%2FRust)
[![crates.io shield](https://img.shields.io/crates/v/seed_examples)](https://crates.io/crates/seed_examples)

The Seed Rust library provides convenient access to the Seed APIs from Rust.

## Documentation

API reference documentation is available [here](https://www.docs.fernapi.com).

## Installation

Add this to your `Cargo.toml`:

```toml
[dependencies]
seed_examples = "0.1.0"
```

Or install via cargo:

```sh
cargo add seed_examples
```

## Base Readme Custom Section

Base Readme Custom Content for seed_examples:0.1.0

## Override Section

Override Content

## Generator Invocation Custom Section

Generator Invocation Custom Content for seed_examples:0.1.0

## Usage

Instantiate and use the client with the following:

```rust
use chrono::NaiveDate;
use seed_examples::prelude::*;
use std::collections::{HashMap, HashSet};

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

## Errors

When the API returns a non-success status code (4xx or 5xx response), an error will be returned.

```rust
use seed_examples::prelude::{*};

#[tokio::main]
async fn main() -> Result<(), ApiError> {
    let config = ClientConfig {
        base_url: " ".to_string(),
        api_key: Some("your-api-key".to_string())
    };
    let client = ExamplesClient::new(config)?;
    match client.some_method().await {
        Ok(response) => {
            println!("Success: {:?}", response);
        },
        Err(ApiError::HTTP { status, message }) => {
            println!("API Error {}: {:?}", status, message);
        },
        Err(e) => {
            println!("Other error: {:?}", e);
        }
    }
    return Ok(());
}
```

## Pagination

For paginated endpoints, the SDK automatically handles pagination using async streams. Use `futures::StreamExt` to iterate through all pages.

```rust
use seed_examples::prelude::{*};
use futures::{StreamExt};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: " ".to_string(),
        api_key: Some("your-api-key".to_string())
    };
    let client = ExamplesClient::new(config).expect("Failed to build client");
    let mut paginated_stream = client.service.create_movie().await?;
    while let Some(item) = paginated_stream.next().await {
            match item {
                Ok(data) => println!("Received item: {:?}", data),
                Err(e) => eprintln!("Error fetching page: {}", e),
            }
        }
}
```

## Advanced

### Retries

The SDK is instrumented with automatic retries with exponential backoff. A request will be retried as long
as the request is deemed retryable and the number of retry attempts has not grown larger than the configured
retry limit (default: 2).

A request is deemed retryable when any of the following HTTP status codes is returned:

- [408](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/408) (Timeout)
- [429](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429) (Too Many Requests)
- [5XX](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500) (Internal Server Errors)

Use the `max_retries` method to configure this behavior.

```rust
use seed_examples::prelude::{*};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: " ".to_string(),
        api_key: Some("your-api-key".to_string()),
        max_retries: 3
    };
    let client = ExamplesClient::new(config).expect("Failed to build client");
}
```

### Timeouts

The SDK defaults to a 30 second timeout. Use the `timeout` method to configure this behavior.

```rust
use seed_examples::prelude::{*};
use std::time::{Duration};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: " ".to_string(),
        api_key: Some("your-api-key".to_string()),
        timeout: Duration::from_secs(30)
    };
    let client = ExamplesClient::new(config).expect("Failed to build client");
}
```

## Contributing

While we value open-source contributions to this SDK, this library is generated programmatically.
Additions made directly to this library would have to be moved over to our generation code,
otherwise they would be overwritten upon the next generated release. Feel free to open a PR as
a proof of concept, but know that we will not be able to merge it as-is. We suggest opening
an issue first to discuss with us!

On the other hand, contributions to the README are always very welcome!