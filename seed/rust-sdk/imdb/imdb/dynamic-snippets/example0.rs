use seed_api::{ApiClient, ClientConfig};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        api_key: Some("<token>".to_string()),
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .imdb_create_movie(serde_json::json!({"title":"title","rating":1.1}))
        .await;
}
