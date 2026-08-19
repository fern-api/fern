use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct ProblemClient3 {
    pub http_client: HttpClient,
}

impl ProblemClient3 {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// Returns lightweight versions of all problems
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
    ///     client.v2.problem.get_lightweight_problems(None).await;
    /// }
    /// ```
    pub async fn get_lightweight_problems(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Vec<LightweightProblemInfoV22>, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/problems-v2/lightweight-problem-info",
                None,
                None,
                options,
            )
            .await
    }

    /// Returns latest versions of all problems
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
    ///     client.v2.problem.get_problems(None).await;
    /// }
    /// ```
    pub async fn get_problems(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Vec<ProblemInfoV22>, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/problems-v2/problem-info",
                None,
                None,
                options,
            )
            .await
    }

    /// Returns latest version of a problem
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
    ///         .v2
    ///         .problem
    ///         .get_latest_problem(&ProblemId("problemId".to_string()), None)
    ///         .await;
    /// }
    /// ```
    pub async fn get_latest_problem(
        &self,
        problem_id: &ProblemId,
        options: Option<RequestOptions>,
    ) -> Result<ProblemInfoV22, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("/problems-v2/problem-info/{}", problem_id.0),
                None,
                None,
                options,
            )
            .await
    }

    /// Returns requested version of a problem
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
    ///         .v2
    ///         .problem
    ///         .get_problem_version(&ProblemId("problemId".to_string()), 1, None)
    ///         .await;
    /// }
    /// ```
    pub async fn get_problem_version(
        &self,
        problem_id: &ProblemId,
        problem_version: i64,
        options: Option<RequestOptions>,
    ) -> Result<ProblemInfoV22, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!(
                    "/problems-v2/problem-info/{}/version/{}",
                    problem_id.0, problem_version
                ),
                None,
                None,
                options,
            )
            .await
    }
}
