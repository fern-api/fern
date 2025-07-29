use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct EnumClient {
    pub client: Client,
    pub base_url: String,
}

impl EnumClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn get_and_return_enum(&self, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
