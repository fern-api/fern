use seed_examples::{ClientConfig, ExamplesClient, GetMetadataRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        api_key: Some("<token>".to_string()),
    };
    let client = ExamplesClient::new(config).expect("Failed to build client");
    client
        .service_get_metadata(GetMetadataRequest {
            shallow: Some(true),
            tag: vec![Some("tag")],
            x_api_version: "X-API-Version",
        })
        .await;
}
