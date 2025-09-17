use seed_streaming::{ClientConfig, GenerateRequest, StreamingClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = StreamingClient::new(config).expect("Failed to build client");
    client
        .dummy_generate(GenerateRequest {
            stream: true,
            num_events: 1,
        })
        .await;
}
