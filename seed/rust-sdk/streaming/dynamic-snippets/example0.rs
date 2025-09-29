use seed_streaming::{ClientConfig, GenerateStreamRequest, StreamingClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = StreamingClient::new(config).expect("Failed to build client");
    client
        .dummy_generate_stream(GenerateStreamRequest {
            stream: true,
            num_events: 1,
        })
        .await;
}
