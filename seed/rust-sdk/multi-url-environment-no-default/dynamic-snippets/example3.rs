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
        .s3
        .getpresignedurl(
            &S3GetPresignedUrlRequest {
                s3key: "s3Key".to_string(),
            },
            None,
        )
        .await;
}
