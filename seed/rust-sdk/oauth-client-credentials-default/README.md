# Seed Rust Library

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=Seed%2FRust)
[![crates.io shield](https://img.shields.io/crates/v/seed_oauth_client_credentials_default)](https://crates.io/crates/seed_oauth_client_credentials_default)

The Seed Rust library provides convenient access to the Seed APIs from Rust.

## Installation

Add this to your `Cargo.toml`:

```toml
[dependencies]
seed_oauth_client_credentials_default = "0.0.1"
```

Or install via cargo:

```sh
cargo add seed_oauth_client_credentials_default
```

## Reference

A full reference for this library is available [here](./reference.md).

## Usage

Instantiate and use the client with the following:

```rust
use seed_oauth_client_credentials_default::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = OauthClientCredentialsDefaultClient::new(config).expect("Failed to build client");
    client
        .auth
        .get_token(
            &GetTokenRequest {
                client_id: "client_id".to_string(),
                client_secret: "client_secret".to_string(),
                grant_type: "client_credentials".to_string(),
            },
            None,
        )
        .await;
}
```

## Errors

When the API returns a non-success status code (4xx or 5xx response), an error will be returned.

```rust
match client.auth.get_token(None)?.await {
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
```

## Request Types

The SDK exports all request types as Rust structs. Simply import them from the crate to access them:

```rust
use seed_oauth_client_credentials_default::prelude::{*};

let request = GetTokenRequest {
    ...
};
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
let response = client.auth.get_token(
    Some(RequestOptions::new().max_retries(3))
)?.await;
```

### Timeouts

The SDK defaults to a 30 second timeout. Use the `timeout` method to configure this behavior.

```rust
let response = client.auth.get_token(
    Some(RequestOptions::new().timeout_seconds(30))
)?.await;
```

### Additional Headers

You can add custom headers to requests using `RequestOptions`.

```rust
let response = client.auth.get_token(
    Some(
        RequestOptions::new()
            .additional_header("X-Custom-Header", "custom-value")
            .additional_header("X-Another-Header", "another-value")
    )
)?
.await;
```

### Additional Query String Parameters

You can add custom query parameters to requests using `RequestOptions`.

```rust
let response = client.auth.get_token(
    Some(
        RequestOptions::new()
            .additional_query_param("filter", "active")
            .additional_query_param("sort", "desc")
    )
)?
.await;
```

## Contributing

While we value open-source contributions to this SDK, this library is generated programmatically.
Additions made directly to this library would have to be moved over to our generation code,
otherwise they would be overwritten upon the next generated release. Feel free to open a PR as
a proof of concept, but know that we will not be able to merge it as-is. We suggest opening
an issue first to discuss with us!

On the other hand, contributions to the README are always very welcome!