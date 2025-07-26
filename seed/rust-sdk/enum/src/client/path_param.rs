use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct PathParamClient {
    pub client: Client,
    pub base_url: String,
}

impl PathParamClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn send(&self, operand: &String, operand_or_color: &String) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
