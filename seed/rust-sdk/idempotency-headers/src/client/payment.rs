use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct PaymentClient {
    pub http_client: HttpClient,
    pub token: Option<String>,
}

impl PaymentClient {
    pub fn new(config: ClientConfig, token: Option<String>) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client, token })
    }

    pub async fn create(&self, request: &serde_json::Value, options: Option<RequestOptions>) -> Result<uuid::Uuid, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/payment",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn delete(&self, payment_id: &String, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_request(
            Method::DELETE,
            &format!("/payment/{}", payment_id),
            None,
            None,
            options,
        ).await
    }

}

