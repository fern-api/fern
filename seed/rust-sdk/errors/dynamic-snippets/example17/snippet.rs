use seed_errors::{ClientConfig, ErrorsClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = ErrorsClient::new(config).expect("Failed to build client");
    client.simple_foo_with_examples(serde_json::json!({"bar":"bar"})).await;
}
