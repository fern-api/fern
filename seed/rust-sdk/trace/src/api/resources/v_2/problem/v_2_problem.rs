use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct V2ProblemClient {
    pub http_client: HttpClient,
}

impl V2ProblemClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

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

    pub async fn get_problem_version(
        &self,
        problem_id: &ProblemId,
        problem_version: i32,
        options: Option<RequestOptions>,
    ) -> Result<ProblemInfoV2, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!(
                    "/problems-v2/problem-info/{}{}",
                    problem_id.0, problem_version
                ),
                None,
                None,
                options,
            )
            .await
    }
}
