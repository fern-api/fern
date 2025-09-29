use seed_multi_url_environment::{ClientConfig, GetPresignedUrlRequest, MultiUrlEnvironmentClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        api_key: Some("<token>".to_string()),
    };
    let client = MultiUrlEnvironmentClient::new(config).expect("Failed to build client");
    client
        .s_3_get_presigned_url(GetPresignedUrlRequest { s_3_key: "s3Key" })
        .await;
}
