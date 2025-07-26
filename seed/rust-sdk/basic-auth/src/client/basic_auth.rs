use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct BasicAuthClient {
    pub client: Client,
    pub base_url: String,
}

impl BasicAuthClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn get_with_basic_auth(&self) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn post_with_basic_auth(&self, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
