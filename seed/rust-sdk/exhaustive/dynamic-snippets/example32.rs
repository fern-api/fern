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
        .params
        .get_with_allow_multiple_query(
            &GetWithAllowMultipleQueryQueryRequest {
                query: vec!["query".to_string()],
                number: vec![1],
            },
            None,
        )
        .await;
}
