use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};

pub struct OptionalClient {
    pub http_client: HttpClient,
}

impl OptionalClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn send_optional_body(&self, request: &Option<HashMap<String, serde_json::Value>>, options: Option<RequestOptions>) -> Result<String, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "send-optional-body",
            Some(serde_json::to_value(request).unwrap_or_default()),
            options,
        ).await
    }

}

