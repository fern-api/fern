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
        .create_complex_profile(
            &ComplexProfile {
                id: "id".to_string(),
                nullable_role: Some(UserRole::Admin),
                optional_role: Some(UserRole::Admin),
                optional_nullable_role: Some(Some(UserRole::Admin)),
                nullable_status: Some(UserStatus::Active),
                optional_status: Some(UserStatus::Active),
                optional_nullable_status: Some(Some(UserStatus::Active)),
                nullable_notification: Some(NotificationMethod::Email {
                    data: EmailNotification {
                        email_address: "emailAddress".to_string(),
                        subject: "subject".to_string(),
                        html_content: Some("htmlContent".to_string()),
                    },
                }),
                optional_notification: Some(NotificationMethod::Email {
                    data: EmailNotification {
                        email_address: "emailAddress".to_string(),
                        subject: "subject".to_string(),
                        html_content: Some("htmlContent".to_string()),
                    },
                }),
                optional_nullable_notification: Some(Some(NotificationMethod::Email {
                    data: EmailNotification {
                        email_address: "emailAddress".to_string(),
                        subject: "subject".to_string(),
                        html_content: Some("htmlContent".to_string()),
                    },
                })),
                nullable_search_result: Some(SearchResult::User {
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
                optional_search_result: Some(SearchResult::User {
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
                nullable_array: Some(vec![
                    "nullableArray".to_string(),
                    "nullableArray".to_string(),
                ]),
                optional_array: Some(vec![
                    "optionalArray".to_string(),
                    "optionalArray".to_string(),
                ]),
                optional_nullable_array: Some(Some(vec![
                    "optionalNullableArray".to_string(),
                    "optionalNullableArray".to_string(),
                ])),
                nullable_list_of_nullables: Some(vec![
                    Some("nullableListOfNullables".to_string()),
                    Some("nullableListOfNullables".to_string()),
                ]),
                nullable_map_of_nullables: Some(HashMap::from([(
                    "nullableMapOfNullables".to_string(),
                    Some(Address {
                        street: "street".to_string(),
                        city: Some("city".to_string()),
                        state: Some("state".to_string()),
                        zip_code: "zipCode".to_string(),
                        country: Some(Some("country".to_string())),
                        building_id: NullableUserId(Some("buildingId".to_string())),
                        tenant_id: OptionalUserId(Some("tenantId".to_string())),
                    }),
                )])),
                nullable_list_of_unions: Some(vec![
                    NotificationMethod::Email {
                        data: EmailNotification {
                            email_address: "emailAddress".to_string(),
                            subject: "subject".to_string(),
                            html_content: Some("htmlContent".to_string()),
                        },
                    },
                    NotificationMethod::Email {
                        data: EmailNotification {
                            email_address: "emailAddress".to_string(),
                            subject: "subject".to_string(),
                            html_content: Some("htmlContent".to_string()),
                        },
                    },
                ]),
                optional_map_of_enums: Some(HashMap::from([(
                    "optionalMapOfEnums".to_string(),
                    UserRole::Admin,
                )])),
            },
            None,
        )
        .await;
}
