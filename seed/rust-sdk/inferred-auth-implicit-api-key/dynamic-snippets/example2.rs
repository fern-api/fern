use seed_inferred_auth_implicit_api_key::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = InferredAuthImplicitApiKeyClient::new(config).expect("Failed to build client");
    client.nested.api.get_something(None).await;
}
