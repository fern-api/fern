use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct DummyClient {
    pub http_client: HttpClient,
}

impl DummyClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn generate(
        &self,
        request: &GenerateRequest,
        options: Option<RequestOptions>,
    ) -> Result<serde_json::Value, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "generate",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }
}
