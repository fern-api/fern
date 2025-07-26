use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct OptionalClient {
    pub client: Client,
    pub base_url: String,
}

impl OptionalClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn send_optional_body(&self, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
