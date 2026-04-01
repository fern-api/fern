use seed_client_side_params::prelude::{*};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ClientSideParamsClient::new(config).expect("Failed to build client");
    client.service.list_resources(&ListResourcesQueryRequest {
        page: 1,
        per_page: 1,
        sort: "created_at".to_string(),
        order: "desc".to_string(),
        include_totals: true,
        fields: Some("fields".to_string()),
        search: Some("search".to_string())
    }, None).await;
}
