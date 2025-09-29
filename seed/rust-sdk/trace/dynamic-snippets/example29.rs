use seed_trace::{ClientConfig, TraceClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        api_key: Some("<token>".to_string()),
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client.sysprop_get_num_warm_instances().await;
}
