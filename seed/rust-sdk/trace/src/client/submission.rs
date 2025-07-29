use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct SubmissionClient {
    pub client: Client,
    pub base_url: String,
}

impl SubmissionClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn create_execution_session(&self, language: &String) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn get_execution_session(&self, session_id: &String) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn stop_execution_session(&self, session_id: &String) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn get_execution_sessions_state(&self) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
