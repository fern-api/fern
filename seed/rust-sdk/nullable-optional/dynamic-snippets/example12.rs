use seed_nullable_optional::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = NullableOptionalClient::new(config).expect("Failed to build client");
    client
        .nullable_optional
        .get_search_results(
            &SearchRequest {
                query: "query".to_string(),
                filters: Some(HashMap::from([(
                    "filters".to_string(),
                    Some("filters".to_string()),
                )])),
                include_types: Some(vec!["includeTypes".to_string(), "includeTypes".to_string()]),
            },
            None,
        )
        .await;
}
