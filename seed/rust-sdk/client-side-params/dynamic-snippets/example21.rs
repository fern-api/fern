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
        .service
        .listclients(
            &ListclientsQueryRequest {
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
