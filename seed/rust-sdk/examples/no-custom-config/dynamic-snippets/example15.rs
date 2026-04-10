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
        .service
        .createmovie(
            &Movie {
                id: MovieId("id".to_string()),
                prequel: None,
                title: "title".to_string(),
                from: "from".to_string(),
                rating: 1.1,
                r#type: MovieType::Movie,
                tag: CommonsTag("tag".to_string()),
                book: None,
                metadata: HashMap::from([("key".to_string(), serde_json::json!("value"))]),
                revenue: 1000000,
            },
            None,
        )
        .await;
}
