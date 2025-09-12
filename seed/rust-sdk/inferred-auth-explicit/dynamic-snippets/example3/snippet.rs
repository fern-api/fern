use seed_inferred_auth_explicit::{ClientConfig, InferredAuthExplicitClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = InferredAuthExplicitClient::new(config).expect("Failed to build client");
    client.nested_api_get_something().await;
}
