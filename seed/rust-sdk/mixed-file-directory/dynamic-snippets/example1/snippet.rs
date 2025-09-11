use seed_mixed_file_directory::{ClientConfig, MixedFileDirectoryClient, ListUsersRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = MixedFileDirectoryClient::new(config).expect("Failed to build client");
    client.user_list(ListUsersRequest { limit: Some(1) }).await;
}
