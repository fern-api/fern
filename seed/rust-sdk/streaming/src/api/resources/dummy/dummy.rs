use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use futures::Stream;
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

    pub async fn generate_stream(
        &self,
        request: &GenerateStreamRequest,
        options: Option<RequestOptions>,
    ) -> Result<impl Stream<Item = Result<StreamResponse, ApiError>>, ApiError> {
        self.http_client
            .execute_request::<StreamResponse>(
                Method::POST,
                "generate-stream",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    pub async fn generate(
        &self,
        request: &Generateequest,
        options: Option<RequestOptions>,
    ) -> Result<StreamResponse, ApiError> {
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
