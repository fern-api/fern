use seed_examples::prelude::*;
use seed_examples::MovieId;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExamplesClient::new(config).expect("Failed to build client");
    client
        .service
        .get_movie(&MovieId("movieId".to_string()), None)
        .await;
}
