use seed_no_retries::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = NoRetriesClient::new(config).expect("Failed to build client");
    client.retries.get_users(None).await;
}
