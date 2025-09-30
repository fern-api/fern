use seed_path_parameters::{ClientConfig, PathParametersClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = PathParametersClient::new(config).expect("Failed to build client");
    client
        .organizations
        .get_organization_user(
            &"tenant_id".to_string(),
            &"organization_id".to_string(),
            &"user_id".to_string(),
            None,
        )
        .await;
}
