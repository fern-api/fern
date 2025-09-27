use seed_client_side_params::{ClientConfig, ClientSideParamsClient, ListResourcesRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        api_key: Some("<token>".to_string()),
    };
    let client = ClientSideParamsClient::new(config).expect("Failed to build client");
    client
        .service_list_resources(ListResourcesRequest {
            page: 1,
            per_page: 1,
            sort: "created_at",
            order: "desc",
            include_totals: true,
            fields: Some("fields"),
            search: Some("search"),
        })
        .await;
}
