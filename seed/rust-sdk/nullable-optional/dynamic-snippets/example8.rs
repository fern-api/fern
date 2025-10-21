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
        .test_deserialization(
            &DeserializationTestRequest {
                required_string: "requiredString".to_string(),
                nullable_string: Some("nullableString".to_string()),
                optional_string: Some("optionalString".to_string()),
                optional_nullable_string: Some(Some("optionalNullableString".to_string())),
                nullable_enum: Some(UserRole::Admin),
                optional_enum: Some(UserStatus::Active),
                nullable_union: Some(NotificationMethod::Email {
                    data: EmailNotification {
                        email_address: "emailAddress".to_string(),
                        subject: "subject".to_string(),
                        html_content: Some("htmlContent".to_string()),
                    },
                }),
                optional_union: Some(SearchResult::User {
                    data: UserResponse {
                        id: "id".to_string(),
                        username: "username".to_string(),
                        email: Some("email".to_string()),
                        phone: Some("phone".to_string()),
                        created_at: DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z")
                            .unwrap()
                            .with_timezone(&Utc),
                        updated_at: Some(
                            DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z")
                                .unwrap()
                                .with_timezone(&Utc),
                        ),
                        address: Some(Address {
                            street: "street".to_string(),
                            city: Some("city".to_string()),
                            state: Some("state".to_string()),
                            zip_code: "zipCode".to_string(),
                            country: Some(Some("country".to_string())),
                            building_id: NullableUserId(Some("buildingId".to_string())),
                            tenant_id: OptionalUserId(Some("tenantId".to_string())),
                        }),
                    },
                }),
                nullable_list: Some(vec!["nullableList".to_string(), "nullableList".to_string()]),
                nullable_map: Some(HashMap::from([("nullableMap".to_string(), 1)])),
                nullable_object: Some(Address {
                    street: "street".to_string(),
                    city: Some("city".to_string()),
                    state: Some("state".to_string()),
                    zip_code: "zipCode".to_string(),
                    country: Some(Some("country".to_string())),
                    building_id: NullableUserId(Some("buildingId".to_string())),
                    tenant_id: OptionalUserId(Some("tenantId".to_string())),
                }),
                optional_object: Some(Organization {
                    id: "id".to_string(),
                    name: "name".to_string(),
                    domain: Some("domain".to_string()),
                    employee_count: Some(1),
                }),
            },
            None,
        )
        .await;
}
