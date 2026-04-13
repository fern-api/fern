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
        .createcomplexprofile(
            &ComplexProfile {
                id: "id".to_string(),
                nullable_role: UserRole::Admin,
                optional_role: None,
                optional_nullable_role: None,
                nullable_status: UserStatus::Active,
                optional_status: None,
                optional_nullable_status: None,
                nullable_notification: NotificationMethod::NotificationMethodZero(
                    NotificationMethodZero {
                        email_notification_fields: EmailNotification {
                            email_address: "emailAddress".to_string(),
                            subject: "subject".to_string(),
                            ..Default::default()
                        },
                        r#type: NotificationMethodZeroType::Email,
                    },
                ),
                optional_notification: None,
                optional_nullable_notification: None,
                nullable_search_result: SearchResult::SearchResultZero(SearchResultZero {
                    user_response_fields: UserResponse {
                        id: "id".to_string(),
                        username: "username".to_string(),
                        created_at: DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap(),
                        ..Default::default()
                    },
                    r#type: SearchResultZeroType::User,
                }),
                optional_search_result: None,
                nullable_array: None,
                optional_array: None,
                optional_nullable_array: None,
                nullable_list_of_nullables: None,
                nullable_map_of_nullables: None,
                nullable_list_of_unions: None,
                optional_map_of_enums: None,
            },
            None,
        )
        .await;
}
