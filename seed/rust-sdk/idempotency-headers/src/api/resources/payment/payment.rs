use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions, WithRawResponse};
use reqwest::Method;
use uuid::Uuid;

pub struct PaymentClient {
    pub http_client: HttpClient,
}

impl PaymentClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn create(
        &self,
        request: &CreatePaymentRequest,
        options: Option<RequestOptions>,
    ) -> Result<Uuid, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/payment",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// Returns a `WithRawResponse<T>` that includes both the parsed
    /// response data and the raw HTTP response metadata (status code and headers).
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// The parsed response wrapped with raw HTTP metadata
    pub async fn create_with_raw_response(
        &self,
        request: &CreatePaymentRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<Uuid>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "/payment",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn delete(
        &self,
        payment_id: &str,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::DELETE,
                &format!("/payment/{}", payment_id),
                None,
                None,
                options,
            )
            .await
    }

    /// Returns a `WithRawResponse<T>` that includes both the parsed
    /// response data and the raw HTTP response metadata (status code and headers).
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// The parsed response wrapped with raw HTTP metadata
    pub async fn delete_with_raw_response(
        &self,
        payment_id: &str,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<()>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::DELETE,
                &format!("/payment/{}", payment_id),
                None,
                None,
                options,
            )
            .await
    }
}
