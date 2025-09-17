use seed_client_side_params::{ClientConfig, ClientSideParamsClient, GetResourceRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        api_key: Some("<token>".to_string()),
    };
    let client = ClientSideParamsClient::new(config).expect("Failed to build client");
    client
        .service_get_resource(
            "resourceId",
            GetResourceRequest {
                include_metadata: true,
                format: "json",
            },
        )
        .await;
}
