use seed_unions::prelude::*;
use std::collections::HashMap;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = UnionsClient::new(config).expect("Failed to build client");
    client
        .union_
        .update(
            &Shape::Circle {
                data: Circle { radius: 1.1 },
            },
            None,
        )
        .await;
}
