use seed_exhaustive::{ClientConfig, ExhaustiveClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        api_key: Some("<token>".to_string())
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client.endpoints_union__get_and_return_union(serde_json::json!({"animal":"dog","name":"name","likesToWoof":true})).await;
}
