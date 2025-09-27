use seed_nullable_optional::{ClientConfig, FilterByRoleRequest, NullableOptionalClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = NullableOptionalClient::new(config).expect("Failed to build client");
    client
        .nullable_optional_filter_by_role(FilterByRoleRequest {
            role: Some("ADMIN"),
            status: Some("active"),
            secondary_role: Some(Some("ADMIN")),
        })
        .await;
}
