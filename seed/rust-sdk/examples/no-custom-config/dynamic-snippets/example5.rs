use seed_examples::{ClientConfig, ExamplesClient, GetFileRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        api_key: Some("<token>".to_string()),
    };
    let client = ExamplesClient::new(config).expect("Failed to build client");
    client
        .file_service_get_file(
            "file.txt",
            GetFileRequest {
                x_file_api_version: "0.0.2",
            },
        )
        .await;
}
