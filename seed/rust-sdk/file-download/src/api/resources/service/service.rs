use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct ServiceClient {
    pub http_client: HttpClient,
}

impl ServiceClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn simple(&self, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client
            .execute_request(Method::POST, "/snippet", None, None, options)
            .await
    }

    pub async fn download_file(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Vec<u8>, ApiError> {
        self.http_client
            .execute_request(Method::POST, "", None, None, options)
            .await
    }
}
