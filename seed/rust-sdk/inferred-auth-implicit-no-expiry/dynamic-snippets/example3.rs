use seed_inferred_auth_implicit_no_expiry::{ClientConfig, InferredAuthImplicitNoExpiryClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = InferredAuthImplicitNoExpiryClient::new(config).expect("Failed to build client");
    client.nested_api_get_something().await;
}
