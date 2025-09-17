use seed_mixed_file_directory::{ClientConfig, GetEventMetadataRequest, MixedFileDirectoryClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = MixedFileDirectoryClient::new(config).expect("Failed to build client");
    client
        .user_events_metadata_get_metadata(GetEventMetadataRequest { id: "id" })
        .await;
}
