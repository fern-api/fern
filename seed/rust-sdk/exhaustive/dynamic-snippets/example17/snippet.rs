use seed_exhaustive::{ClientConfig, ExhaustiveClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        api_key: Some("<token>".to_string())
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client.endpoints_object_get_and_return_with_map_of_map(serde_json::json!({"map":{"map":{"map":"map"}}})).await;
}
