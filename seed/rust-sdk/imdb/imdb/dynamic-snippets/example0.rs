use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .imdb
        .create_movie(
            &CreateMovieRequest {
                title: "title".to_string(),
                rating: 1.1,
            },
            None,
        )
        .await;
}
