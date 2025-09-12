use seed_version::{ClientConfig, VersionClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = VersionClient::new(config).expect("Failed to build client");
    client.user_get_user("userId").await;
}
