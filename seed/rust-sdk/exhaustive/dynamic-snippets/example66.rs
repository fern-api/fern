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
        .endpoints_params
        .endpoints_params_get_with_allow_multiple_query(
            &EndpointsParamsGetWithAllowMultipleQueryQueryRequest {
                query: vec![Some("query".to_string())],
                number: vec![Some(1)],
            },
            None,
        )
        .await;
}
