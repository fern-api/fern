use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct Ec2Client {
    pub client: Client,
    pub base_url: String,
}

impl Ec2Client {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn boot_instance(&self, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
