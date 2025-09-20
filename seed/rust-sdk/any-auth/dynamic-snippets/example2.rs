use seed_any_auth::{AnyAuthClient, ClientConfig};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        api_key: Some("<token>".to_string()),
    };
    let client = AnyAuthClient::new(config).expect("Failed to build client");
    client.user_get_admins().await;
}
