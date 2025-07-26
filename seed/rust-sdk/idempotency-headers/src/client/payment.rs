use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct PaymentClient {
    pub client: Client,
    pub base_url: String,
}

impl PaymentClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn create(&self, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn delete(&self, payment_id: &String) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
