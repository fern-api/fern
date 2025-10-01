use seed_variables::{ClientConfig, VariablesClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = VariablesClient::new(config).expect("Failed to build client");
    client.service.post(None).await;
}
