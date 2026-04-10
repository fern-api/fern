use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .endpoints_content_type
        .endpoints_content_type_post_json_patch_content_with_charset_type(
            &TypesObjectWithOptionalField {
                string: Some("string".to_string()),
                integer: Some(1),
                long: Some(1000000),
                double: Some(1.1),
                bool: Some(true),
                datetime: Some(DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap()),
                date: Some(NaiveDate::parse_from_str("2023-01-15", "%Y-%m-%d").unwrap()),
                uuid: Some("uuid".to_string()),
                base64: Some("base64".to_string()),
                list: Some(vec!["list".to_string(), "list".to_string()]),
                set: Some(vec!["set".to_string(), "set".to_string()]),
                map: Some(HashMap::from([(
                    "map".to_string(),
                    Some("map".to_string()),
                )])),
                bigint: Some(1),
                ..Default::default()
            },
            None,
        )
        .await;
}
