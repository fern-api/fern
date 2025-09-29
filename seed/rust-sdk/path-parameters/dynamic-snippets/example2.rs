use seed_path_parameters::{ClientConfig, PathParametersClient, SearchOrganizationsRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = PathParametersClient::new(config).expect("Failed to build client");
    client
        .organizations_search_organizations(
            "tenant_id",
            "organization_id",
            SearchOrganizationsRequest { limit: Some(1) },
        )
        .await;
}
