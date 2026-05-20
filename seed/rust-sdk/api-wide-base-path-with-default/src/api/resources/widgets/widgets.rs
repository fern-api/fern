use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct WidgetsClient {
    pub http_client: HttpClient,
}

impl WidgetsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn create(
        &self,
        api_version: &str,
        request: &Widget,
        options: Option<RequestOptions>,
    ) -> Result<Widget, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                &format!("/{}/widgets", api_version),
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
