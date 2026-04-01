use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions, WithRawResponse};
use reqwest::Method;

pub struct ConversationsClient {
    pub http_client: HttpClient,
}

impl ConversationsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// Place an outbound call or validate call setup with dry_run.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn outbound_call(
        &self,
        request: &OutboundCallConversationsRequest,
        options: Option<RequestOptions>,
    ) -> Result<OutboundCallConversationsResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "conversations/outbound-call",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// Place an outbound call or validate call setup with dry_run.
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
    pub async fn outbound_call_with_raw_response(
        &self,
        request: &OutboundCallConversationsRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<OutboundCallConversationsResponse>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "conversations/outbound-call",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
