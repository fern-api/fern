use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct PropertyBasedErrorClient {
    pub client: Client,
    pub base_url: String,
}

impl PropertyBasedErrorClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn throw_error(&self) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
