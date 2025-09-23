use seed_examples::{ClientConfig, ExamplesClient, GetFileRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        api_key: Some("<token>".to_string()),
    };
    let client = ExamplesClient::new(config).expect("Failed to build client");
    client
        .file_service_get_file(
            "filename",
            GetFileRequest {
                x_file_api_version: "X-File-API-Version",
            },
        )
        .await;
}
