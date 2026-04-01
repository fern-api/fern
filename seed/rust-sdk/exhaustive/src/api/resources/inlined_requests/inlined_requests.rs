use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions, WithRawResponse};
use reqwest::Method;

pub struct InlinedRequestsClient {
    pub http_client: HttpClient,
}

impl InlinedRequestsClient {
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
    pub async fn post_with_object_bodyand_response(
        &self,
        request: &PostWithObjectBody,
        options: Option<RequestOptions>,
    ) -> Result<ObjectWithOptionalField, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/req-bodies/object",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// POST with custom object in request body, response is an object
    ///
    /// This method returns a `WithRawResponse<T>` that includes both the parsed
    /// response data and the raw HTTP response metadata (status code and headers).
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// The parsed response wrapped with raw HTTP metadata
    pub async fn post_with_object_bodyand_response_with_raw_response(
        &self,
        request: &PostWithObjectBody,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<ObjectWithOptionalField>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "/req-bodies/object",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
