use seed_streaming::prelude::*;
use std::collections::HashMap;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = StreamingClient::new(config).expect("Failed to build client");
    client
        .dummy
        .generate(
            &Generateequest {
                stream: false,
                num_events: 5,
            },
            None,
        )
        .await;
}
