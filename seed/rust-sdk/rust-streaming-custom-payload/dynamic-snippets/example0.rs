use seed_rust_streaming_custom_payload::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = RustStreamingCustomPayloadClient::new(config).expect("Failed to build client");
    client.chunks.stream(None).await;
}
