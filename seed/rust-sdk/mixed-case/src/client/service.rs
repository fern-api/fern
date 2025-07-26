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

    pub async fn get_resource(&self, resource_id: &String) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn list_resources(&self, page_limit: Option<&String>, before_date: Option<&String>) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
