use seed_mixed_file_directory::{ClientConfig, ListUsersRequest, MixedFileDirectoryClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = MixedFileDirectoryClient::new(config).expect("Failed to build client");
    client.user_list(ListUsersRequest { limit: Some(1) }).await;
}
