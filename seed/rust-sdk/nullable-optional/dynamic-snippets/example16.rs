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
                nullable_string: None,
                optional_string: None,
                optional_nullable_string: None,
                nullable_enum: UserRole::Admin,
                optional_enum: None,
                nullable_union: NotificationMethod::NotificationMethodZero(
                    NotificationMethodZero {
                        email_notification_fields: EmailNotification {
                            email_address: "emailAddress".to_string(),
                            subject: "subject".to_string(),
                            ..Default::default()
                        },
                        r#type: NotificationMethodZeroType::Email,
                    },
                ),
                optional_union: None,
                nullable_list: None,
                nullable_map: None,
                nullable_object: Address {
                    street: "street".to_string(),
                    zip_code: "zipCode".to_string(),
                    ..Default::default()
                },
                optional_object: None,
            },
            None,
        )
        .await;
}
