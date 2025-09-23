use seed_examples::{ClientConfig, ExamplesClient, GetMetadataRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        api_key: Some("<token>".to_string()),
    };
    let client = ExamplesClient::new(config).expect("Failed to build client");
    client
        .service_get_metadata(GetMetadataRequest {
            shallow: Some(false),
            tag: vec![Some("development")],
            x_api_version: "0.0.1",
        })
        .await;
}
