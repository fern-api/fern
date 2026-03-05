use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct ServiceClient3 {
    pub http_client: HttpClient,
}

impl ServiceClient3 {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// This endpoint checks the health of a resource.
    ///
    /// # Arguments
    ///
    /// * `id` - The id to check
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// Empty response
    pub async fn check(
        &self,
        id: &String,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(Method::GET, &format!("/check/{}", id), None, None, options)
            .await
    }

    /// This endpoint checks the health of the service.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn ping(&self, options: Option<RequestOptions>) -> Result<bool, ApiError> {
        self.http_client
            .execute_request(Method::GET, "/ping", None, None, options)
            .await
    }
}
