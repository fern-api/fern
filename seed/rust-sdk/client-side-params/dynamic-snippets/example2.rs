use seed_client_side_params::{ClientConfig, ClientSideParamsClient, SearchResourcesRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        api_key: Some("<token>".to_string()),
    };
    let client = ClientSideParamsClient::new(config).expect("Failed to build client");
    client
        .service_search_resources(SearchResourcesRequest {
            limit: 1,
            offset: 1,
            query: Some("query"),
            filters: Some(todo!("Unhandled type reference")),
        })
        .await;
}
