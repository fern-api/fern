use seed_http_head::{ClientConfig, HttpHeadClient, ListUsersRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = HttpHeadClient::new(config).expect("Failed to build client");
    client.user_list(ListUsersRequest { limit: 1 }).await;
}
