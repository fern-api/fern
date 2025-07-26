use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct S3Client {
    pub client: Client,
    pub base_url: String,
}

impl S3Client {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn get_presigned_url(&self, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
