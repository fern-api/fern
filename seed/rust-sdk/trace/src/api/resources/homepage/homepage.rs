use crate::api::types::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct HomepageClient {
    pub http_client: HttpClient,
}

impl HomepageClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config)?,
        })
    }

    pub async fn get_homepage_problems(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Vec<ProblemId>, ApiError> {
        self.http_client
            .execute_request(Method::GET, "/homepage-problems", None, None, options)
            .await
    }

    pub async fn set_homepage_problems(
        &self,
        request: &Vec<ProblemId>,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/homepage-problems",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }
}
