use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct ParamsClient {
    pub client: Client,
    pub base_url: String,
}

impl ParamsClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn get_with_path(&self, param: &String) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn get_with_inline_path(&self, param: &String) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn get_with_query(&self, query: Option<&String>, number: Option<&String>) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn get_with_allow_multiple_query(&self, query: Option<&String>, number: Option<&String>) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn get_with_path_and_query(&self, param: &String, query: Option<&String>) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn get_with_inline_path_and_query(&self, param: &String, query: Option<&String>) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn modify_with_path(&self, param: &String, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn modify_with_inline_path(&self, param: &String, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
