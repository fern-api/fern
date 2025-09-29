use seed_any_auth::{AnyAuthClient, ClientConfig};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = AnyAuthClient::new(config).expect("Failed to build client");
    client.user.get_admins(None).await;
}
