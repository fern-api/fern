use seed_multi_line_docs::{ClientConfig, MultiLineDocsClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = MultiLineDocsClient::new(config).expect("Failed to build client");
    client.user_get_user("userId").await;
}
