use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions, WithRawResponse};
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

    /// Creates a problem
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn create_problem(
        &self,
        request: &CreateProblemRequest,
        options: Option<RequestOptions>,
    ) -> Result<CreateProblemResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/problem-crud/create",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// Creates a problem
    ///
    /// This method returns a `WithRawResponse<T>` that includes both the parsed
    /// response data and the raw HTTP response metadata (status code and headers).
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// The parsed response wrapped with raw HTTP metadata
    pub async fn create_problem_with_raw_response(
        &self,
        request: &CreateProblemRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<CreateProblemResponse>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "/problem-crud/create",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// Updates a problem
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
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
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// Updates a problem
    ///
    /// This method returns a `WithRawResponse<T>` that includes both the parsed
    /// response data and the raw HTTP response metadata (status code and headers).
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// The parsed response wrapped with raw HTTP metadata
    pub async fn update_problem_with_raw_response(
        &self,
        problem_id: &ProblemId,
        request: &CreateProblemRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<UpdateProblemResponse>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                &format!("/problem-crud/update/{}", problem_id.0),
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// Soft deletes a problem
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// Empty response
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

    /// Soft deletes a problem
    ///
    /// This method returns a `WithRawResponse<T>` that includes both the parsed
    /// response data and the raw HTTP response metadata (status code and headers).
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// The parsed response wrapped with raw HTTP metadata
    pub async fn delete_problem_with_raw_response(
        &self,
        problem_id: &ProblemId,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<()>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::DELETE,
                &format!("/problem-crud/delete/{}", problem_id.0),
                None,
                None,
                options,
            )
            .await
    }

    /// Returns default starter files for problem
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn get_default_starter_files(
        &self,
        request: &GetDefaultStarterFilesRequest,
        options: Option<RequestOptions>,
    ) -> Result<GetDefaultStarterFilesResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/problem-crud/default-starter-files",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// Returns default starter files for problem
    ///
    /// This method returns a `WithRawResponse<T>` that includes both the parsed
    /// response data and the raw HTTP response metadata (status code and headers).
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// The parsed response wrapped with raw HTTP metadata
    pub async fn get_default_starter_files_with_raw_response(
        &self,
        request: &GetDefaultStarterFilesRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<GetDefaultStarterFilesResponse>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "/problem-crud/default-starter-files",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
