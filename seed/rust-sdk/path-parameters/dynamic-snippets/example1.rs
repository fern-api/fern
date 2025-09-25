use seed_path_parameters::{ClientConfig, GetOrganizationUserRequest, PathParametersClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = PathParametersClient::new(config).expect("Failed to build client");
    client
        .organizations_get_organization_user(
            "tenant_id",
            "organization_id",
            "user_id",
            GetOrganizationUserRequest {},
        )
        .await;
}
