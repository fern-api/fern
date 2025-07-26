use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct AdminClient {
    pub client: Client,
    pub base_url: String,
}

impl AdminClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn update_test_submission_status(&self, submission_id: &String, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn send_test_submission_update(&self, submission_id: &String, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn update_workspace_submission_status(&self, submission_id: &String, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn send_workspace_submission_update(&self, submission_id: &String, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn store_traced_test_case(&self, submission_id: &String, test_case_id: &String, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn store_traced_test_case_v_2(&self, submission_id: &String, test_case_id: &String, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn store_traced_workspace(&self, submission_id: &String, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn store_traced_workspace_v_2(&self, submission_id: &String, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
