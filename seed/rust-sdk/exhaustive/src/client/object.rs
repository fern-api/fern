use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct ObjectClient {
    pub client: Client,
    pub base_url: String,
}

impl ObjectClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn get_and_return_with_optional_field(&self, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn get_and_return_with_required_field(&self, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn get_and_return_with_map_of_map(&self, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn get_and_return_nested_with_optional_field(&self, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn get_and_return_nested_with_required_field(&self, string: &String, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn get_and_return_nested_with_required_field_as_list(&self, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
