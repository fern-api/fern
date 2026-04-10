use seed_http_head::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = HttpHeadClient::new(config).expect("Failed to build client");
    client.user.list(&ListQueryRequest { limit: 1 }, None).await;
}
