use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};

pub struct S3Client {
    pub http_client: HttpClient,
    pub token: Option<String>,
}

impl S3Client {
    pub fn new(config: ClientConfig, token: Option<String>) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client, token })
    }

    pub async fn get_presigned_url(&self, request: &serde_json::Value, options: Option<RequestOptions>) -> Result<String, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/s3/presigned-url",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

}

