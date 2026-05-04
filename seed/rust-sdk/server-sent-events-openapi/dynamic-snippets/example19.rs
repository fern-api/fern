use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .stream_x_fern_streaming_shared_schema_stream(
            &StreamXFernStreamingSharedSchemaStreamRequest {
                prompt: "prompt".to_string(),
                model: "model".to_string(),
                stream: true,
            },
            None,
        )
        .await;
}
