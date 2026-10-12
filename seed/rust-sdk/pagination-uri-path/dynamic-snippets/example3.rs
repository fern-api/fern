use seed_pagination_uri_path::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = PaginationUriPathClient::new(config).expect("Failed to build client");
    client.users.list_with_path_pagination(None).await;
}
