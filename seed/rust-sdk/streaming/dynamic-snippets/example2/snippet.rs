use seed_streaming::{ClientConfig, StreamingClient, Generateequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = StreamingClient::new(config).expect("Failed to build client");
    client.dummy_generate(Generateequest { stream: false, num_events: 1 }).await;
}
