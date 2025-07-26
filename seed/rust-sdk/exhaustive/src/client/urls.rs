use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct UrlsClient {
    pub client: Client,
    pub base_url: String,
}

impl UrlsClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn with_mixed_case(&self) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn no_ending_slash(&self) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn with_ending_slash(&self) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn with_underscores(&self) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
