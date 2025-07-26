use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct AuthClient {
    pub client: Client,
    pub base_url: String,
}

impl AuthClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn get_token(&self, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
