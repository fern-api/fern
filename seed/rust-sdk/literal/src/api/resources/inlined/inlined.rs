use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct InlinedClient {
    pub http_client: HttpClient,
}

impl InlinedClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn send(
        &self,
        request: &SendLiteralsInlinedRequest,
        options: Option<RequestOptions>,
    ) -> Result<SendResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "inlined",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }
}
