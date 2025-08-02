use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct SubmissionClient {
    pub http_client: HttpClient,
    pub api_key: Option<String>,
    pub bearer_token: Option<String>,
    pub username: Option<String>,
    pub password: Option<String>,
}

impl SubmissionClient {
    pub fn new(config: ClientConfig, api_key: Option<String>, bearer_token: Option<String>, username: Option<String>, password: Option<String>) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { 
            http_client, 
            api_key, 
            bearer_token, 
            username, 
            password 
        })
    }

    pub async fn create_execution_session(&self, language: &Language, options: Option<RequestOptions>) -> Result<ExecutionSessionResponse, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            &format!("/sessions/create-session/{}", language),
            None,
            None,
            options,
        ).await
    }

    pub async fn get_execution_session(&self, session_id: &String, options: Option<RequestOptions>) -> Result<Option<ExecutionSessionResponse>, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/sessions/{}", session_id),
            None,
            None,
            options,
        ).await
    }

    pub async fn stop_execution_session(&self, session_id: &String, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_request(
            Method::DELETE,
            &format!("/sessions/stop/{}", session_id),
            None,
            None,
            options,
        ).await
    }

    pub async fn get_execution_sessions_state(&self, options: Option<RequestOptions>) -> Result<GetExecutionSessionStateResponse, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/sessions/execution-sessions-state",
            None,
            None,
            options,
        ).await
    }

}

