use seed_streaming::{ClientConfig, Generateequest, StreamingClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = StreamingClient::new(config).expect("Failed to build client");
    client
        .dummy_generate(Generateequest {
            stream: false,
            num_events: 5,
        })
        .await;
}
