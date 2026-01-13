use seed_unknown_as_any::prelude::*;
use seed_unknown_as_any::MyObject;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = UnknownAsAnyClient::new(config).expect("Failed to build client");
    client
        .unknown
        .post_object(
            &MyObject {
                unknown: serde_json::json!({"key":"value"}),
            },
            None,
        )
        .await;
}
