use seed_mixed_file_directory::{ClientConfig, MixedFileDirectoryClient, ListUserEventsRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = MixedFileDirectoryClient::new(config).expect("Failed to build client");
    client.user_events_list_events(ListUserEventsRequest { limit: Some(1) }).await;
}
