use seed_client_side_params::{ClientConfig, ClientSideParamsClient, ListUsersRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        api_key: Some("<token>".to_string()),
    };
    let client = ClientSideParamsClient::new(config).expect("Failed to build client");
    client
        .service_list_users(ListUsersRequest {
            page: Some(1),
            per_page: Some(1),
            include_totals: Some(true),
            sort: Some("sort"),
            connection: Some("connection"),
            q: Some("q"),
            search_engine: Some("search_engine"),
            fields: Some("fields"),
        })
        .await;
}
