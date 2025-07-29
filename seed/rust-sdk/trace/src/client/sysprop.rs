use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct SyspropClient {
    pub client: Client,
    pub base_url: String,
}

impl SyspropClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn set_num_warm_instances(&self, language: &String, num_warm_instances: &String) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn get_num_warm_instances(&self) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
