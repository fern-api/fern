use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct NullableClient {
    pub client: Client,
    pub base_url: String,
}

impl NullableClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn get_users(&self, usernames: Option<&String>, avatar: Option<&String>, activated: Option<&String>, tags: Option<&String>, extra: Option<&String>) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn create_user(&self, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn delete_user(&self, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
