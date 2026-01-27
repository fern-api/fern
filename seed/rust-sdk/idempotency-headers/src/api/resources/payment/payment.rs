use crate::{ClientConfig, ApiError, HttpClient, RequestOptions};
use reqwest::{Method};
use uuid::{Uuid};
use crate::api::{*};

pub struct PaymentClient {
    pub http_client: HttpClient,
}

impl PaymentClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
    http_client: HttpClient::new(config.clone())?
})
    }

    pub async fn create(&self, request: &CreatePaymentRequest, options: Option<RequestOptions>) -> Result<Uuid, ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "/payment",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn delete(&self, payment_id: &String, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client.execute_request(
            Method::DELETE,
            &format!("/payment/{}", payment_id),
            None,
            None,
            options,
        ).await
    }

}

