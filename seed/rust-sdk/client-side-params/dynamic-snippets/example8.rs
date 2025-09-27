use seed_client_side_params::{ClientConfig, ClientSideParamsClient, ListConnectionsRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        api_key: Some("<token>".to_string()),
    };
    let client = ClientSideParamsClient::new(config).expect("Failed to build client");
    client
        .service_list_connections(ListConnectionsRequest {
            strategy: Some("strategy"),
            name: Some("name"),
            fields: Some("fields"),
        })
        .await;
}
