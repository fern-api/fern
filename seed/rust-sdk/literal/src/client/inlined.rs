use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct InlinedClient {
    pub client: Client,
    pub base_url: String,
}

impl InlinedClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn send(&self, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
