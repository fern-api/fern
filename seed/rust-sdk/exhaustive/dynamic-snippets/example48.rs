use seed_exhaustive::{ClientConfig, ExhaustiveClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        api_key: Some("<token>".to_string()),
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client.no_req_body_get_with_no_request_body().await;
}
