use seed_streaming::{ClientConfig, StreamingClient, GenerateStreamRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = StreamingClient::new(config).expect("Failed to build client");
    client.dummy_generate_stream(GenerateStreamRequest { stream: true, num_events: 1 }).await;
}
