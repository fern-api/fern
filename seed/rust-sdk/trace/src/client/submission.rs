use crate::{ClientConfig, ApiError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct SubmissionClient {
    pub http_client: HttpClient,
}

impl SubmissionClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn create_execution_session(&self, language: &Language, options: Option<RequestOptions>) -> Result<ExecutionSessionResponse, ApiError> {
        self.http_client.execute_request(
            Method::POST,
            &format!("/sessions/create-session/{}", language),
            None,
            None,
            options,
        ).await
    }

    pub async fn get_execution_session(&self, session_id: &String, options: Option<RequestOptions>) -> Result<Option<ExecutionSessionResponse>, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/sessions/{}", session_id),
            None,
            None,
            options,
        ).await
    }

    pub async fn stop_execution_session(&self, session_id: &String, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client.execute_request(
            Method::DELETE,
            &format!("/sessions/stop/{}", session_id),
            None,
            None,
            options,
        ).await
    }

    pub async fn get_execution_sessions_state(&self, options: Option<RequestOptions>) -> Result<GetExecutionSessionStateResponse, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            "/sessions/execution-sessions-state",
            None,
            None,
            options,
        ).await
    }

}

