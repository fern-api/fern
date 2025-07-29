use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct UnionClient {
    pub client: Client,
    pub base_url: String,
}

impl UnionClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn get(&self, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn get_metadata(&self) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn update_metadata(&self, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn call(&self, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn duplicate_types_union(&self, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn nested_unions(&self, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
