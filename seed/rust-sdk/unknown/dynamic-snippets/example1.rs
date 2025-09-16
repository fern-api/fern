use seed_unknown_as_any::{ClientConfig, UnknownAsAnyClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = UnknownAsAnyClient::new(config).expect("Failed to build client");
    client
        .unknown_post_object(serde_json::json!({"unknown":{"key":"value"}}))
        .await;
}
