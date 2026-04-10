use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .nullableoptional
        .getsearchresults(
            &NullableOptionalGetSearchResultsRequest {
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
