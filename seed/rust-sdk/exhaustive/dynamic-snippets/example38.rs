use seed_exhaustive::{ClientConfig, ExhaustiveClient, PutRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        api_key: Some("<token>".to_string()),
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client.endpoints_put_add("id", PutRequest {}).await;
}
