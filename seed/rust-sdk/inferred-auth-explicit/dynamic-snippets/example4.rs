use seed_inferred_auth_explicit::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = InferredAuthExplicitClient::new(config).expect("Failed to build client");
    client.simple.get_something(None).await;
}
