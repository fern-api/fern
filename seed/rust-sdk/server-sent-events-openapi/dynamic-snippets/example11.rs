use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .stream_data_context_with_envelope_schema(
            &StreamRequest {
                query: Some("query".to_string()),
                ..Default::default()
            },
            None,
        )
        .await;
}
