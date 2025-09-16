use seed_http_head::{ClientConfig, HttpHeadClient, ListUsersRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = HttpHeadClient::new(config).expect("Failed to build client");
    client.user_list(ListUsersRequest { limit: 1 }).await;
}
