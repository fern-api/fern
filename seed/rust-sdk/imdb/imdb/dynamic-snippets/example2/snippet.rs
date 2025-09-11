use seed_api::{ClientConfig, ApiClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        api_key: Some("<token>".to_string())
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client.imdb_get_movie("movieId").await;
}
