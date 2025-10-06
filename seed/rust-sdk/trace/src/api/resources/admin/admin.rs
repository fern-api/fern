use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct AdminClient {
    pub http_client: HttpClient,
}

impl AdminClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn update_test_submission_status(
        &self,
        submission_id: &SubmissionSubmissionId,
        request: &SubmissionTestSubmissionStatus,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                &format!("/admin/store-test-submission-status/{}", submission_id.0),
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    pub async fn send_test_submission_update(
        &self,
        submission_id: &SubmissionSubmissionId,
        request: &SubmissionTestSubmissionUpdate,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                &format!("/admin/store-test-submission-status-v2/{}", submission_id.0),
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    pub async fn update_workspace_submission_status(
        &self,
        submission_id: &SubmissionSubmissionId,
        request: &SubmissionWorkspaceSubmissionStatus,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                &format!(
                    "/admin/store-workspace-submission-status/{}",
                    submission_id.0
                ),
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    pub async fn send_workspace_submission_update(
        &self,
        submission_id: &SubmissionSubmissionId,
        request: &SubmissionWorkspaceSubmissionUpdate,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                &format!(
                    "/admin/store-workspace-submission-status-v2/{}",
                    submission_id.0
                ),
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    pub async fn store_traced_test_case(
        &self,
        submission_id: &SubmissionSubmissionId,
        test_case_id: &String,
        request: &StoreTracedTestCaseRequest,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                &format!(
                    "/admin/store-test-trace/submission/{}{}",
                    submission_id.0, test_case_id
                ),
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    pub async fn store_traced_test_case_v_2(
        &self,
        submission_id: &SubmissionSubmissionId,
        test_case_id: &V2ProblemTestCaseId,
        request: &Vec<SubmissionTraceResponseV2>,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                &format!(
                    "/admin/store-test-trace-v2/submission/{}{}",
                    submission_id.0, test_case_id.0
                ),
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    pub async fn store_traced_workspace(
        &self,
        submission_id: &SubmissionSubmissionId,
        request: &StoreTracedWorkspaceRequest,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                &format!(
                    "/admin/store-workspace-trace/submission/{}",
                    submission_id.0
                ),
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    pub async fn store_traced_workspace_v_2(
        &self,
        submission_id: &SubmissionSubmissionId,
        request: &Vec<SubmissionTraceResponseV2>,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                &format!(
                    "/admin/store-workspace-trace-v2/submission/{}",
                    submission_id.0
                ),
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }
}
