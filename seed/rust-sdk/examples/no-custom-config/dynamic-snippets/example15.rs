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
                rating: 8,
                r#type: "movie".to_string(),
                tag: Tag("tag-wf9as23d".to_string()),
                metadata: HashMap::from([
                    (
                        "actors".to_string(),
                        vec![
                            "Christian Bale".to_string(),
                            "Florence Pugh".to_string(),
                            "Willem Dafoe".to_string(),
                        ],
                    ),
                    ("releaseDate".to_string(), "2023-12-08".to_string()),
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
