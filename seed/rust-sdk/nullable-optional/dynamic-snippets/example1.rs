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
        .create_user(
            &CreateUserRequest {
                username: "username".to_string(),
                email: Some("email".to_string()),
                phone: Some("phone".to_string()),
                address: Some(Some(Address {
                    street: "street".to_string(),
                    city: Some("city".to_string()),
                    state: Some("state".to_string()),
                    zip_code: "zipCode".to_string(),
                    country: Some(Some("country".to_string())),
                    building_id: NullableUserId(Some("buildingId".to_string())),
                    tenant_id: OptionalUserId(Some("tenantId".to_string())),
                })),
            },
            None,
        )
        .await;
}
