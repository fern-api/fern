use crate::api::*;
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

    pub async fn get_direct_thread(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Response, ApiError> {
        self.http_client
            .execute_request(Method::GET, "", None, None, options)
            .await
    }
}
