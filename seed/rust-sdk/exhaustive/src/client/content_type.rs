use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct ContentTypeClient {
    pub client: Client,
    pub base_url: String,
}

impl ContentTypeClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn post_json_patch_content_type(&self, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn post_json_patch_content_with_charset_type(&self, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
