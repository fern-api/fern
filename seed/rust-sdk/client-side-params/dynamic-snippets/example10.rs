use seed_client_side_params::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ClientSideParamsClient::new(config).expect("Failed to build client");
    client
        .service
        .list_clients(
            &ListClientsQueryRequest {
                fields: Some("fields".to_string()),
                include_fields: Some(true),
                page: Some(1),
                per_page: Some(1),
                include_totals: Some(true),
                is_global: Some(true),
                is_first_party: Some(true),
                app_type: Some(vec!["app_type".to_string(), "app_type".to_string()]),
                ..Default::default()
            },
            None,
        )
        .await;
}
