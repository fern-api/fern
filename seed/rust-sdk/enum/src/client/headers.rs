use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct HeadersClient {
    pub client: Client,
    pub base_url: String,
}

impl HeadersClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn send(&self) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
