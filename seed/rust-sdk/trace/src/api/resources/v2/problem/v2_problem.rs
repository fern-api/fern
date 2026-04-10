use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct ProblemClient2 {
    pub http_client: HttpClient,
}

impl ProblemClient2 {
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
    pub async fn get_lightweight_problems(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Vec<LightweightProblemInfoV2>, ApiError> {
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
    pub async fn get_problems(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Vec<ProblemInfoV2>, ApiError> {
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
    pub async fn get_latest_problem(
        &self,
        problem_id: &ProblemId,
        options: Option<RequestOptions>,
    ) -> Result<ProblemInfoV2, ApiError> {
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
    pub async fn get_problem_version(
        &self,
        problem_id: &ProblemId,
        problem_version: i64,
        options: Option<RequestOptions>,
    ) -> Result<ProblemInfoV2, ApiError> {
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
