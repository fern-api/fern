use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct HttpMethodsClient {
    pub client: Client,
    pub base_url: String,
}

impl HttpMethodsClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn test_get(&self, id: &String) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn test_post(&self, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn test_put(&self, id: &String, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn test_patch(&self, id: &String, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn test_delete(&self, id: &String) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
