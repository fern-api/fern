# Seed Rust Library

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=Seed%2FRust)
[![crates.io shield](https://img.shields.io/crates/v/seed_websocket_auth)](https://crates.io/crates/seed_websocket_auth)

The Seed Rust library provides convenient access to the Seed APIs from Rust.

## Installation

Add this to your `Cargo.toml`:

```toml
[dependencies]
seed_websocket_auth = "0.1.0"
```

Or install via cargo:

```sh
cargo add seed_websocket_auth
```

## Usage

Instantiate and use the client with the following:

```rust
use seed_websocket_auth::{ClientConfig, GetTokenRequest, WebsocketAuthClient};
use std::collections::HashMap;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = WebsocketAuthClient::new(config).expect("Failed to build client");
    client
        .auth
        .get_token_with_client_credentials(
            &GetTokenRequest {
                x_api_key: "X-Api-Key".to_string(),
                client_id: "client_id".to_string(),
                client_secret: "client_secret".to_string(),
                audience: "https://api.example.com".to_string(),
                grant_type: "client_credentials".to_string(),
                scope: Some("scope".to_string()),
            },
            None,
        )
        .await;
}
```

## Errors

When the API returns a non-success status code (4xx or 5xx response), an error will be returned.

```rust
use seed_websocket_auth::{ApiError, ClientConfig, WebsocketAuthClient};

#[tokio::main]
async fn main() -> Result<(), ApiError> {
    let config = ClientConfig {
        base_url: " ".to_string(),
        api_key: Some("your-api-key".to_string())
    };
    let client = WebsocketAuthClient::new(config)?;
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
use seed_websocket_auth::{ClientConfig, WebsocketAuthClient};
use futures::{StreamExt};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: " ".to_string(),
        api_key: Some("your-api-key".to_string())
    };
    let client = WebsocketAuthClient::new(config).expect("Failed to build client");
    let mut paginated_stream = client.auth.get_token_with_client_credentials().await?;
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
use seed_websocket_auth::{ClientConfig, WebsocketAuthClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: " ".to_string(),
        api_key: Some("your-api-key".to_string()),
        max_retries: 3
    };
    let client = WebsocketAuthClient::new(config).expect("Failed to build client");
}
```

### Timeouts

The SDK defaults to a 30 second timeout. Use the `timeout` method to configure this behavior.

```rust
use seed_websocket_auth::{ClientConfig, WebsocketAuthClient};
use std::time::{Duration};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: " ".to_string(),
        api_key: Some("your-api-key".to_string()),
        timeout: Duration::from_secs(30)
    };
    let client = WebsocketAuthClient::new(config).expect("Failed to build client");
}
```

## Contributing

While we value open-source contributions to this SDK, this library is generated programmatically.
Additions made directly to this library would have to be moved over to our generation code,
otherwise they would be overwritten upon the next generated release. Feel free to open a PR as
a proof of concept, but know that we will not be able to merge it as-is. We suggest opening
an issue first to discuss with us!

On the other hand, contributions to the README are always very welcome!