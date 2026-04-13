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
        .testdeserialization(
            &DeserializationTestRequest {
                required_string: "requiredString".to_string(),
                nullable_string: Some("nullableString".to_string()),
                optional_string: Some("optionalString".to_string()),
                optional_nullable_string: Some("optionalNullableString".to_string()),
                nullable_enum: UserRole::Admin,
                optional_enum: Some(UserStatus::Active),
                nullable_union: NotificationMethod::NotificationMethodZero(
                    NotificationMethodZero {
                        email_notification_fields: EmailNotification {
                            email_address: "emailAddress".to_string(),
                            subject: "subject".to_string(),
                            html_content: Some("htmlContent".to_string()),
                            ..Default::default()
                        },
                        r#type: NotificationMethodZeroType::Email,
                    },
                ),
                optional_union: Some(SearchResult::SearchResultZero(SearchResultZero {
                    user_response_fields: UserResponse {
                        id: "id".to_string(),
                        username: "username".to_string(),
                        email: Some("email".to_string()),
                        phone: Some("phone".to_string()),
                        created_at: DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap(),
                        updated_at: Some(
                            DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap(),
                        ),
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
                    r#type: SearchResultZeroType::User,
                })),
                nullable_list: Some(vec!["nullableList".to_string(), "nullableList".to_string()]),
                nullable_map: Some(HashMap::from([("nullableMap".to_string(), Some(1))])),
                nullable_object: Address {
                    street: "street".to_string(),
                    city: Some("city".to_string()),
                    state: Some("state".to_string()),
                    zip_code: "zipCode".to_string(),
                    country: Some("country".to_string()),
                    building_id: Some(NullableUserId(Some("buildingId".to_string()))),
                    tenant_id: Some(OptionalUserId(Some("tenantId".to_string()))),
                    ..Default::default()
                },
                optional_object: Some(Organization {
                    id: "id".to_string(),
                    name: "name".to_string(),
                    domain: Some("domain".to_string()),
                    employee_count: Some(1),
                    ..Default::default()
                }),
            },
            None,
        )
        .await;
}
