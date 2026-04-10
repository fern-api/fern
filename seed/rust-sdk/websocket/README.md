# Seed Rust Library

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=Seed%2FRust)
[![crates.io shield](https://img.shields.io/crates/v/seed_websocket)](https://crates.io/crates/seed_websocket)

The Seed Rust library provides convenient access to the Seed APIs from Rust.

## Table of Contents

- [Installation](#installation)
- [Reference](#reference)
- [Websockets](#websockets)
- [Contributing](#contributing)

## Installation

Add this to your `Cargo.toml`:

```toml
[dependencies]
seed_websocket = "0.0.1"
```

Or install via cargo:

```sh
cargo add seed_websocket
```

## Reference

A full reference for this library is available [here](./reference.md).

## Websockets

The SDK supports WebSocket connections for real-time communication. Use the generated channel clients to connect, send, and receive messages.

```rust
use seed_websocket::prelude::*;

let client = WebsocketClient::new(ClientConfig {
    token: Some("your-api-key".to_string()),
    ..Default::default()
})
.expect("Failed to create client");

// Connect to the WebSocket
let mut empty_realtime = client.empty_realtime.connect().await.expect("Failed to connect");

// Close the connection when done
empty_realtime.close().await.expect("Failed to close");
```

## Contributing

While we value open-source contributions to this SDK, this library is generated programmatically.
Additions made directly to this library would have to be moved over to our generation code,
otherwise they would be overwritten upon the next generated release. Feel free to open a PR as
a proof of concept, but know that we will not be able to merge it as-is. We suggest opening
an issue first to discuss with us!

On the other hand, contributions to the README are always very welcome!
