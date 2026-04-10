use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct InlinedrequestsClient {
    pub http_client: HttpClient,
}

impl InlinedrequestsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
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
    pub async fn postwithobjectbodyandresponse(
        &self,
        request: &InlinedRequestsPostWithObjectBodyandResponseRequest,
        options: Option<RequestOptions>,
    ) -> Result<TypesObjectWithOptionalField, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "req-bodies/object",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
