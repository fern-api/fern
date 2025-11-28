use seed_path_parameters::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = PathParametersClient::new(config).expect("Failed to build client");
    client
        .organizations
        .search_organizations(
            &"tenant_id".to_string(),
            &"organization_id".to_string(),
            &SearchOrganizationsQueryRequest {
                limit: Some(1),
                ..Default::default()
            },
            None,
        )
        .await;
}
