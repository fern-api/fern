use crate::{ClientConfig, ApiError, HttpClient, RequestOptions};
use reqwest::{Method};

pub struct PropertyBasedErrorClient {
    pub http_client: HttpClient,
}

impl PropertyBasedErrorClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
    http_client: HttpClient::new(config.clone())?
})
    }

    /// GET request that always throws an error
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn throw_error(&self, options: Option<RequestOptions>) -> Result<String, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            "property-based-error",
            None,
            None,
            options,
        ).await
    }

}

