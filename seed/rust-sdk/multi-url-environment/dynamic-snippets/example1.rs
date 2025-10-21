use seed_multi_url_environment::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = MultiUrlEnvironmentClient::new(config).expect("Failed to build client");
    client
        .s_3
        .get_presigned_url(
            &GetPresignedUrlRequest {
                s_3_key: "s3Key".to_string(),
            },
            None,
        )
        .await;
}
