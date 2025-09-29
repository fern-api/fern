use seed_client_side_params::{ClientConfig, ClientSideParamsClient, ListClientsRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        api_key: Some("<token>".to_string()),
    };
    let client = ClientSideParamsClient::new(config).expect("Failed to build client");
    client
        .service_list_clients(ListClientsRequest {
            fields: Some("fields"),
            include_fields: Some(true),
            page: Some(1),
            per_page: Some(1),
            include_totals: Some(true),
            is_global: Some(true),
            is_first_party: Some(true),
            app_type: Some(vec!["app_type", "app_type"]),
        })
        .await;
}
