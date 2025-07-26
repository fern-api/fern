use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct ReqWithHeadersClient {
    pub client: Client,
    pub base_url: String,
}

impl ReqWithHeadersClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn get_with_custom_header(&self, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
