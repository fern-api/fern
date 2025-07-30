use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct ProblemClient {
    pub http_client: HttpClient,
}

impl ProblemClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn create_problem(&self, request: &CreateProblemRequest, options: Option<RequestOptions>) -> Result<CreateProblemResponse, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/problem-crud/create",
            Some(serde_json::to_value(request).unwrap_or_default()),
            options,
        ).await
    }

    pub async fn update_problem(&self, problem_id: &ProblemId, request: &CreateProblemRequest, options: Option<RequestOptions>) -> Result<UpdateProblemResponse, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            &format!("/problem-crud/update/{}", problem_id.0),
            Some(serde_json::to_value(request).unwrap_or_default()),
            options,
        ).await
    }

    pub async fn delete_problem(&self, problem_id: &ProblemId, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_request(
            Method::DELETE,
            &format!("/problem-crud/delete/{}", problem_id.0),
            None,
            options,
        ).await
    }

    pub async fn get_default_starter_files(&self, request: &serde_json::Value, options: Option<RequestOptions>) -> Result<GetDefaultStarterFilesResponse, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/problem-crud/default-starter-files",
            Some(serde_json::to_value(request).unwrap_or_default()),
            options,
        ).await
    }

}

