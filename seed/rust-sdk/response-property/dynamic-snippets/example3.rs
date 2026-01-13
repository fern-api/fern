use seed_response_property::prelude::{*};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ResponsePropertyClient::new(config).expect("Failed to build client");
    client.service.get_movie(&"string".to_string(), None).await;
}
