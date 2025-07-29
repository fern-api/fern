use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct ComplexClient {
    pub client: Client,
    pub base_url: String,
}

impl ComplexClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn search(&self, index: &String, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
