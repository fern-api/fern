use seed_inferred_auth_implicit::{ClientConfig, InferredAuthImplicitClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = InferredAuthImplicitClient::new(config).expect("Failed to build client");
    client.nested.api.get_something(None).await;
}
