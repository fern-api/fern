use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .file_upload_example
        .upload_file(
            &UploadFileRequest {
                file: todo!("Missing file value"),
                name: "name".to_string(),
            },
            None,
        )
        .await;
}
