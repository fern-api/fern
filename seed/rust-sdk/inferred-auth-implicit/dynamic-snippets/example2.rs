use seed_inferred_auth_implicit::{ClientConfig, InferredAuthImplicitClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = InferredAuthImplicitClient::new(config).expect("Failed to build client");
    client.nested_no_auth_api_get_something().await;
}
