use custom_imdb_sdk::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = CustomImdbClient::new(config).expect("Failed to build client");
    client
        .imdb
        .get_movie(&MovieId("movieId".to_string()), None)
        .await;
}
