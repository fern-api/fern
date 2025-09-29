use seed_multi_line_docs::{ClientConfig, MultiLineDocsClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = MultiLineDocsClient::new(config).expect("Failed to build client");
    client.user.get_user(&"userId".to_string(), None).await;
}
