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
                id: MovieId("id".to_string()),
                prequel: Some(MovieId("prequel".to_string())),
                title: "title".to_string(),
                from: "from".to_string(),
                rating: 1.1,
                r#type: "movie".to_string(),
                tag: Tag("tag".to_string()),
                book: Some("book".to_string()),
                metadata: HashMap::from([(
                    "metadata".to_string(),
                    serde_json::json!({"key":"value"}),
                )]),
                revenue: 1000000,
            },
            None,
        )
        .await;
}
