use seed_content_types::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ContentTypesClient::new(config).expect("Failed to build client");
    client
        .service
        .patch_complex(
            &"id".to_string(),
            &PatchComplexRequest {
                name: Some("name".to_string()),
                age: Some(1),
                active: Some(true),
                metadata: Some(HashMap::from([(
                    "metadata".to_string(),
                    serde_json::json!({"key":"value"}),
                )])),
                tags: Some(vec!["tags".to_string(), "tags".to_string()]),
                email: Some(Some("email".to_string())),
                nickname: Some(Some("nickname".to_string())),
                bio: Some(Some("bio".to_string())),
                profile_image_url: Some(Some("profileImageUrl".to_string())),
                settings: Some(Some(HashMap::from([(
                    "settings".to_string(),
                    serde_json::json!({"key":"value"}),
                )]))),
                ..Default::default()
            },
            None,
        )
        .await;
}
