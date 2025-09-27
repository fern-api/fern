use seed_inferred_auth_implicit::{ClientConfig, InferredAuthImplicitClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = InferredAuthImplicitClient::new(config).expect("Failed to build client");
    client.simple_get_something().await;
}
