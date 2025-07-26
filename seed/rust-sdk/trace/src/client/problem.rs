use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct ProblemClient {
    pub client: Client,
    pub base_url: String,
}

impl ProblemClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn get_lightweight_problems(&self) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn get_problems(&self) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn get_latest_problem(&self, problem_id: &String) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn get_problem_version(&self, problem_id: &String, problem_version: &String) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
erde_json::Value, ApiError> {
        todo!()
    }

}
