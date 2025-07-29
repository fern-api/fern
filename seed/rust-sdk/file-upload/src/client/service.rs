use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct ServiceClient {
    pub client: Client,
    pub base_url: String,
}

impl ServiceClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn post(&self, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn just_file(&self, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn just_file_with_query_params(&self, maybe_string: Option<&String>, integer: Option<&String>, maybe_integer: Option<&String>, list_of_strings: Option<&String>, optional_list_of_strings: Option<&String>, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn with_content_type(&self, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn with_form_encoding(&self, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn with_form_encoded_containers(&self, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn optional_args(&self, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn simple(&self) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
