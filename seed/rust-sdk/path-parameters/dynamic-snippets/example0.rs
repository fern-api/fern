use seed_path_parameters::{ClientConfig, PathParametersClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = PathParametersClient::new(config).expect("Failed to build client");
    client
        .organizations_get_organization("tenant_id", "organization_id")
        .await;
}
