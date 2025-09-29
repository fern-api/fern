use seed_nullable_optional::{ClientConfig, NullableOptionalClient, SearchRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = NullableOptionalClient::new(config).expect("Failed to build client");
    client
        .nullable_optional_get_search_results(SearchRequest {
            query: "query",
            filters: Some(todo!("Unhandled type reference")),
            include_types: Some(vec!["includeTypes", "includeTypes"]),
        })
        .await;
}
