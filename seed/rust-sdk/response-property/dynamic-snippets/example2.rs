use seed_response_property::{ClientConfig, ResponsePropertyClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = ResponsePropertyClient::new(config).expect("Failed to build client");
    client.service_get_movie("string").await;
}
