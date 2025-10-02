use seed_mixed_file_directory::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = MixedFileDirectoryClient::new(config).expect("Failed to build client");
    client
        .user
        .events
        .metadata
        .get_metadata(
            &GetMetadataQueryRequest {
                id: Id("id".to_string()),
            },
            None,
        )
        .await;
}
