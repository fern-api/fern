use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct FilesClient {
    pub http_client: HttpClient,
}

impl FilesClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn upload(
        &self,
        request: &FilesUploadRequest,
        options: Option<RequestOptions>,
    ) -> Result<String, ApiError> {
        let base_url = self
            .http_client
            .config()
            .environment
            .as_ref()
            .map_or(self.http_client.base_url(), |env| env.upload_url());
        self.http_client
            .execute_request_with_base_url(
                base_url,
                Method::POST,
                "files/content",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
