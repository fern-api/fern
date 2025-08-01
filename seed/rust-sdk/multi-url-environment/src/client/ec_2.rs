use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};

pub struct Ec2Client {
    pub http_client: HttpClient,
    pub token: Option<String>,
}

impl Ec2Client {
    pub fn new(config: ClientConfig, token: Option<String>) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client, token })
    }

    pub async fn boot_instance(&self, request: &serde_json::Value, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/ec2/boot",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

}

