use seed_file_upload::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = FileUploadClient::new(config).expect("Failed to build client");
    client
        .service
        .optional_args(
            &OptionalArgsRequest {
                image_file: todo!("Missing file value"),
                request: todo!("Missing body property value"),
            },
            None,
        )
        .await;
}
