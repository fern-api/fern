use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct ServiceClient2 {
    pub http_client: HttpClient,
}

impl ServiceClient2 {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn get_direct_thread(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Response2, ApiError> {
        self.http_client
            .execute_request(Method::GET, "/partner-path", None, None, options)
            .await
    }
}
