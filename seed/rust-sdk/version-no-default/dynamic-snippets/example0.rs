use seed_version::{ClientConfig, VersionClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = VersionClient::new(config).expect("Failed to build client");
    client.user_get_user("userId").await;
}
