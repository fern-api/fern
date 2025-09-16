use seed_multi_url_environment_no_default::{
    ClientConfig, GetPresignedUrlRequest, MultiUrlEnvironmentNoDefaultClient,
};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        api_key: Some("<token>".to_string()),
    };
    let client = MultiUrlEnvironmentNoDefaultClient::new(config).expect("Failed to build client");
    client
        .s_3_get_presigned_url(GetPresignedUrlRequest { s_3_key: "s3Key" })
        .await;
}
