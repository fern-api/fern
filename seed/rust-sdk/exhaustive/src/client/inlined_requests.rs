use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct InlinedRequestsClient {
    pub client: Client,
    pub base_url: String,
}

impl InlinedRequestsClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn post_with_object_bodyand_response(&self, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
