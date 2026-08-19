use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct SubmissionClient {
    pub http_client: HttpClient,
}

impl SubmissionClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// Returns sessionId and execution server URL for session. Spins up server.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    ///
    /// # Examples
    ///
    /// ```no_run
    /// use seed_trace::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = TraceClient::new(config).expect("Failed to build client");
    ///     client
    ///         .submission
    ///         .create_execution_session(&Language::Java, None)
    ///         .await;
    /// }
    /// ```
    pub async fn create_execution_session(
        &self,
        language: &Language,
        options: Option<RequestOptions>,
    ) -> Result<ExecutionSessionResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                &format!("/sessions/create-session/{}", language),
                None,
                None,
                options,
            )
            .await
    }

    /// Returns execution server URL for session. Returns empty if session isn't registered.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    ///
    /// # Examples
    ///
    /// ```no_run
    /// use seed_trace::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = TraceClient::new(config).expect("Failed to build client");
    ///     client
    ///         .submission
    ///         .get_execution_session(&"sessionId".to_string(), None)
    ///         .await;
    /// }
    /// ```
    pub async fn get_execution_session(
        &self,
        session_id: &str,
        options: Option<RequestOptions>,
    ) -> Result<Option<ExecutionSessionResponse>, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("/sessions/{}", session_id),
                None,
                None,
                options,
            )
            .await
    }

    /// Stops execution session.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// Empty response
    ///
    /// # Examples
    ///
    /// ```no_run
    /// use seed_trace::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = TraceClient::new(config).expect("Failed to build client");
    ///     client
    ///         .submission
    ///         .stop_execution_session(&"sessionId".to_string(), None)
    ///         .await;
    /// }
    /// ```
    pub async fn stop_execution_session(
        &self,
        session_id: &str,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::DELETE,
                &format!("/sessions/stop/{}", session_id),
                None,
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_trace::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = TraceClient::new(config).expect("Failed to build client");
    ///     client.submission.get_execution_sessions_state(None).await;
    /// }
    /// ```
    pub async fn get_execution_sessions_state(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<GetExecutionSessionStateResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/sessions/execution-sessions-state",
                None,
                None,
                options,
            )
            .await
    }
}
