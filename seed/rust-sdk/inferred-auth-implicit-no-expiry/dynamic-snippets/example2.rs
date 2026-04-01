use seed_inferred_auth_implicit_no_expiry::prelude::{*};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = InferredAuthImplicitNoExpiryClient::new(config).expect("Failed to build client");
    client.nested_no_auth.api.get_something(None).await;
}
