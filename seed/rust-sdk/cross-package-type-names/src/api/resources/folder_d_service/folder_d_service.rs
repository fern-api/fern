use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct FolderDServiceClient {
    pub http_client: HttpClient,
}

impl FolderDServiceClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn folder_d_service_get_direct_thread(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<FolderDResponse, ApiError> {
        self.http_client
            .execute_request(Method::GET, "folder-d", None, None, options)
            .await
    }
}
