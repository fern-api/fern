use crate::{ClientConfig, ApiError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::api::{*};

pub struct InlinedRequestsClient {
    pub http_client: HttpClient,
}

impl InlinedRequestsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
    http_client: HttpClient::new(config.clone())?
})
    }

    /// POST with custom object in request body, response is an object
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn post_with_object_bodyand_response(&self, request: &PostWithObjectBody, options: Option<RequestOptions>) -> Result<ObjectWithOptionalField, ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "/req-bodies/object",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

}

