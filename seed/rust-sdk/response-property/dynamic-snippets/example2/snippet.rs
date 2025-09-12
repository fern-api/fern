use seed_response_property::{ClientConfig, ResponsePropertyClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = ResponsePropertyClient::new(config).expect("Failed to build client");
    client.service_get_movie("string").await;
}
