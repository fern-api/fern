use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct ProblemClient {
    pub http_client: HttpClient,
}

impl ProblemClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn create_problem(
        &self,
        request: &CreateProblemRequest,
        options: Option<RequestOptions>,
    ) -> Result<CreateProblemResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/problem-crud/create",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    pub async fn update_problem(
        &self,
        problem_id: &ProblemId,
        request: &CreateProblemRequest,
        options: Option<RequestOptions>,
    ) -> Result<UpdateProblemResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                &format!("/problem-crud/update/{}", problem_id.0),
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    pub async fn delete_problem(
        &self,
        problem_id: &ProblemId,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::DELETE,
                &format!("/problem-crud/delete/{}", problem_id.0),
                None,
                None,
                options,
            )
            .await
    }

    pub async fn get_default_starter_files(
        &self,
        request: &GetDefaultStarterFilesRequest,
        options: Option<RequestOptions>,
    ) -> Result<GetDefaultStarterFilesResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/problem-crud/default-starter-files",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }
}
