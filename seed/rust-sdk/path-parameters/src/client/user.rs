use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct UserClient {
    pub client: Client,
    pub base_url: String,
}

impl UserClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn get_user(&self, tenant_id: &String, user_id: &String) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn create_user(&self, tenant_id: &String, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn update_user(&self, tenant_id: &String, user_id: &String, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn search_users(&self, tenant_id: &String, user_id: &String, limit: Option<&String>) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
