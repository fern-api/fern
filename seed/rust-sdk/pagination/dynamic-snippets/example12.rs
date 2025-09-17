use seed_pagination::{ClientConfig, ListWithGlobalConfigRequest, PaginationClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        api_key: Some("<token>".to_string()),
    };
    let client = PaginationClient::new(config).expect("Failed to build client");
    client
        .users_list_with_global_config(ListWithGlobalConfigRequest { offset: Some(1) })
        .await;
}
