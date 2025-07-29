use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct ServiceClient {
    pub client: Client,
    pub base_url: String,
}

impl ServiceClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn endpoint(&self) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn unknown_request(&self, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
