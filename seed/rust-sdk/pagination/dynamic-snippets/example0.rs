use seed_pagination::{ClientConfig, PaginationClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        api_key: Some("<token>".to_string()),
    };
    let client = PaginationClient::new(config).expect("Failed to build client");
    client.complex_search("index", serde_json::json!({"pagination":{"per_page":1,"starting_after":"starting_after"},"query":{"field":"field","operator":"=","value":"value"}})).await;
}
