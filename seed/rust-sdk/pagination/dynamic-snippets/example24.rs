use seed_pagination::{ClientConfig, ListWithGlobalConfigQueryRequest, PaginationClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = PaginationClient::new(config).expect("Failed to build client");
    client
        .users
        .list_with_global_config(&ListWithGlobalConfigQueryRequest { offset: Some(1) }, None)
        .await;
}
