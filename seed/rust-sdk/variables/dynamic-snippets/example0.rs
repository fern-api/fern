use seed_variables::{ClientConfig, VariablesClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = VariablesClient::new(config).expect("Failed to build client");
    client.service_post().await;
}
