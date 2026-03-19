use seed_bytes_upload::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = BytesUploadClient::new(config).expect("Failed to build client");
    client
        .service
        .upload_with_query_params(&"nova-2".to_string(), &None, &vec![], None)
        .await;
}
