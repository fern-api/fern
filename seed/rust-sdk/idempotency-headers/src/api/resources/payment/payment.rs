use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
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

    /// # Examples
    ///
    /// ```no_run
    /// use seed_idempotency_headers::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = IdempotencyHeadersClient::new(config).expect("Failed to build client");
    ///     client
    ///         .payment
    ///         .create(
    ///             &CreatePaymentRequest {
    ///                 amount: 1,
    ///                 currency: Currency::Usd,
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
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

    /// # Examples
    ///
    /// ```no_run
    /// use seed_idempotency_headers::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = IdempotencyHeadersClient::new(config).expect("Failed to build client");
    ///     client.payment.delete(&"paymentId".to_string(), None).await;
    /// }
    /// ```
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
}
