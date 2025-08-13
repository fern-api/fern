# Seed Rust Library

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=Seed%2FRust)
[![crates.io shield](https://img.shields.io/crates/v/seed_http_head)](https://crates.io/crates/seed_http_head)

The Seed Rust library provides convenient access to the Seed API from Rust.

## Installation

Add this to your `Cargo.toml`:

```toml
[dependencies]
seed_http_head = "0.1.0"
```

Or install via cargo:

```sh
cargo add seed_http_head
```

## Usage

Instantiate and use the client with the following:

```rust
use seed_http_head::{ClientConfig, HttpHeadClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = HttpHeadClient::new(config).expect("Failed to build client");
}
```

## Errors

When the API returns a non-success status code (4xx or 5xx response), an error will be returned.

```rust
use seed_http_head::{ClientError, ClientConfig, HttpHeadClient};

#[tokio::main]
async fn main() -> Result<(), ClientError> {
    let config = ClientConfig {
        base_url: " ".to_string(),
        api_key: Some("your-api-key".to_string())
    };
    let client = HttpHeadClient::new(config)?;
    match client.some_method().await {
        Ok(response) => {
            println!("Success: {:?}", response);
        },
        Err(ClientError::ApiError { status_code, body, .. }) => {
            println!("API Error {}: {:?}", status_code, body);
        },
        Err(e) => {
            println!("Other error: {:?}", e);
        }
    }
    return Ok(());
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
use seed_http_head::{ClientConfig, HttpHeadClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: " ".to_string(),
        api_key: Some("your-api-key".to_string()),
        max_retries: 3
    };
    let client = HttpHeadClient::new(config).expect("Failed to build client");
}
```

### Timeouts

The SDK defaults to a 30 second timeout. Use the `timeout` method to configure this behavior.

```rust
use seed_http_head::{ClientConfig, HttpHeadClient};
use std::time::{Duration};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: " ".to_string(),
        api_key: Some("your-api-key".to_string()),
        timeout: Duration::from_secs(30)
    };
    let client = HttpHeadClient::new(config).expect("Failed to build client");
}
```

## Contributing

While we value open-source contributions to this SDK, this library is generated programmatically.
Additions made directly to this library would have to be moved over to our generation code,
otherwise they would be overwritten upon the next generated release. Feel free to open a PR as
a proof of concept, but know that we will not be able to merge it as-is. We suggest opening
an issue first to discuss with us!

On the other hand, contributions to the README are always very welcome!