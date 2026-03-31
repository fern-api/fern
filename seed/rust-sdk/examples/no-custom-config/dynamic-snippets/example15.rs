use seed_examples::prelude::*;

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
        .create_movie(
            &Movie {
                id: MovieId("movie-c06a4ad7".to_string()),
                prequel: Some(MovieId("movie-cv9b914f".to_string())),
                title: "The Boy and the Heron".to_string(),
                from: "Hayao Miyazaki".to_string(),
                rating: 8.0,
                r#type: "movie".to_string(),
                tag: Tag("tag-wf9as23d".to_string()),
                book: None,
                metadata: HashMap::from([
                    (
                        "actors".to_string(),
                        serde_json::json!(["Christian Bale", "Florence Pugh", "Willem Dafoe"]),
                    ),
                    ("releaseDate".to_string(), serde_json::json!("2023-12-08")),
                    (
                        "ratings".to_string(),
                        serde_json::json!({"rottenTomatoes":97,"imdb":7.6}),
                    ),
                ]),
                revenue: 1000000,
            },
            None,
        )
        .await;
}
