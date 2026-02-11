use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .endpoints
        .object
        .get_and_return_embeddings(
            &EmbeddingsResponse {
                embeddings: EmbeddingsByModel {
                    float: Some(vec![vec![1.1, 1.1], vec![1.1, 1.1]]),
                    int_8: Some(vec![vec![1, 1], vec![1, 1]]),
                    uint_8: Some(vec![vec![1, 1], vec![1, 1]]),
                    base_64: Some(vec!["base64".to_string(), "base64".to_string()]),
                },
                texts: Some(vec!["texts".to_string(), "texts".to_string()]),
            },
            None,
        )
        .await;
}
