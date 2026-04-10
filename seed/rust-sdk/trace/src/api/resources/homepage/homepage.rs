use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct HomepageClient {
    pub http_client: HttpClient,
}

impl HomepageClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn gethomepageproblems(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Vec<ProblemId>, ApiError> {
        self.http_client
            .execute_request(Method::GET, "homepage-problems", None, None, options)
            .await
    }

    pub async fn sethomepageproblems(
        &self,
        request: &Vec<ProblemId>,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "homepage-problems",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
