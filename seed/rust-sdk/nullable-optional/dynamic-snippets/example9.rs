use seed_nullable_optional::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = NullableOptionalClient::new(config).expect("Failed to build client");
    client
        .nullable_optional
        .filter_by_role(
            &FilterByRoleQueryRequest {
                role: Some(UserRole::Admin),
                status: Some(UserStatus::Active),
                secondary_role: Some(Some(UserRole::Admin)),
                ..Default::default()
            },
            None,
        )
        .await;
}
