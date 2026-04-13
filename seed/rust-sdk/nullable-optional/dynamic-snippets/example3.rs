use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .nullableoptional
        .updateuser(
            &"userId".to_string(),
            &UpdateUserRequest {
                username: Some("username".to_string()),
                email: Some("email".to_string()),
                phone: Some("phone".to_string()),
                address: Some(Address {
                    street: "street".to_string(),
                    city: Some("city".to_string()),
                    state: Some("state".to_string()),
                    zip_code: "zipCode".to_string(),
                    country: Some("country".to_string()),
                    building_id: Some(NullableUserId(Some("buildingId".to_string()))),
                    tenant_id: Some(OptionalUserId(Some("tenantId".to_string()))),
                    ..Default::default()
                }),
                ..Default::default()
            },
            None,
        )
        .await;
}
