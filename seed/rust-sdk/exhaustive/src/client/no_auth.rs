use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct NoAuthClient {
    pub client: Client,
    pub base_url: String,
}

impl NoAuthClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn post_with_no_auth(&self, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
