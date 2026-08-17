# Seed Rust Library

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=Seed%2FRust)
[![crates.io shield](https://img.shields.io/crates/v/seed_websocket_bearer_auth)](https://crates.io/crates/seed_websocket_bearer_auth)

The Seed Rust library provides convenient access to the Seed APIs from Rust.

## Table of Contents

- [Installation](#installation)
- [Reference](#reference)
- [Websockets](#websockets)
- [Advanced](#advanced)
  - [Custom Client](#custom-client)
- [Contributing](#contributing)

## Installation

Add this to your `Cargo.toml`:

```toml
[dependencies]
seed_websocket_bearer_auth = "0.0.1"
```

Or install via cargo:

```sh
cargo add seed_websocket_bearer_auth
```

## Reference

A full reference for this library is available [here](./reference.md).

## Websockets

The SDK supports WebSocket connections for real-time communication. Use the generated channel clients to connect, send, and receive messages.

```rust
use seed_websocket_bearer_auth::prelude::*;

let client = WebsocketBearerAuthClient::new(ClientConfig {
    token: Some("YOUR_API_KEY".to_string()),
    ..Default::default()
})
.expect("Failed to create client");

// Connect to the WebSocket
let mut realtime_no_auth = client.realtime_no_auth.connect(
    "session_id",
    None,
).await.expect("Failed to connect");

// Iterate over messages as they arrive
while let Some(Ok(message)) = realtime_no_auth.recv().await {
    println!("{:?}", message);
}

// Send a message
realtime_no_auth.send_send(&NoAuthSendEvent { /* fields */ }).await.expect("Failed to send");

// Close the connection when done
realtime_no_auth.close().await.expect("Failed to close");
```

## Advanced

### Custom Client

The SDK builds its own `reqwest` client by default, but you can supply your own through
`ClientConfig.reqwest_client` (or `ApiClientBuilder::reqwest_client`) when you need control over the
transport — custom root certificates, client certificates, proxies or connection tuning. The supplied
client is used as-is; authentication, custom headers and retries are still applied by the SDK.

```rust
use seed_websocket_bearer_auth::prelude::*;

let certificate = reqwest::Certificate::from_pem(&std::fs::read("ca.pem")?)?;
let reqwest_client = reqwest::Client::builder()
    .add_root_certificate(certificate)
    .build()
    .expect("Failed to build reqwest client");
let config = ClientConfig {
    reqwest_client: Some(reqwest_client),
    ..Default::default()
};
let client = WebsocketBearerAuthClient::new(config).expect("Failed to build client");
```

## Contributing

While we value open-source contributions to this SDK, this library is generated programmatically.
Additions made directly to this library would have to be moved over to our generation code,
otherwise they would be overwritten upon the next generated release. Feel free to open a PR as
a proof of concept, but know that we will not be able to merge it as-is. We suggest opening
an issue first to discuss with us!

On the other hand, contributions to the README are always very welcome!
