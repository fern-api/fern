use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct NoReqBodyClient {
    pub client: Client,
    pub base_url: String,
}

impl NoReqBodyClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn get_with_no_request_body(&self) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn post_with_no_request_body(&self) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
