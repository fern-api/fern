use seed_version::prelude::*;
use seed_version::UserId;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = VersionClient::new(config).expect("Failed to build client");
    client
        .user
        .get_user(&UserId("userId".to_string()), None)
        .await;
}
