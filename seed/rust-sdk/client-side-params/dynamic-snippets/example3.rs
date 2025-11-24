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
        .list_users(
            &ListUsersQueryRequest {
                page: Some(1),
                per_page: Some(1),
                include_totals: Some(true),
                sort: Some("sort".to_string()),
                connection: Some("connection".to_string()),
                q: Some("q".to_string()),
                search_engine: Some("search_engine".to_string()),
                fields: Some("fields".to_string()),
                ..Default::default()
            },
            None,
        )
        .await;
}
