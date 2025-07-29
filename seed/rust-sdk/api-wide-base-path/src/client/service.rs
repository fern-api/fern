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

    pub async fn post(&self, path_param: &String, service_param: &String, endpoint_param: &String, resource_param: &String) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
