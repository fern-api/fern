use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};
use crate::core::{File, FormDataBuilder};

pub struct AdminClient {
    pub http_client: HttpClient,
}

impl AdminClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn update_test_submission_status(&self, submission_id: &SubmissionId, request: &TestSubmissionStatus, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_request(
            Method::POST,
            &format!("/admin/store-test-submission-status/{}", submission_id.0),
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn send_test_submission_update(&self, submission_id: &SubmissionId, request: &TestSubmissionUpdate, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_request(
            Method::POST,
            &format!("/admin/store-test-submission-status-v2/{}", submission_id.0),
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn update_workspace_submission_status(&self, submission_id: &SubmissionId, request: &WorkspaceSubmissionStatus, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_request(
            Method::POST,
            &format!("/admin/store-workspace-submission-status/{}", submission_id.0),
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn send_workspace_submission_update(&self, submission_id: &SubmissionId, request: &WorkspaceSubmissionUpdate, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_request(
            Method::POST,
            &format!("/admin/store-workspace-submission-status-v2/{}", submission_id.0),
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn store_traced_test_case(&self, submission_id: &SubmissionId, test_case_id: &String, request: &serde_json::Value, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_request(
            Method::POST,
            &format!("/admin/store-test-trace/submission/{}{}", submission_id.0, test_case_id),
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn store_traced_test_case_v_2(&self, submission_id: &SubmissionId, test_case_id: &TestCaseId, request: &Vec<TraceResponseV2>, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_request(
            Method::POST,
            &format!("/admin/store-test-trace-v2/submission/{}{}", submission_id.0, test_case_id.0),
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn store_traced_workspace(&self, submission_id: &SubmissionId, request: &serde_json::Value, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_request(
            Method::POST,
            &format!("/admin/store-workspace-trace/submission/{}", submission_id.0),
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn store_traced_workspace_v_2(&self, submission_id: &SubmissionId, request: &Vec<TraceResponseV2>, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_request(
            Method::POST,
            &format!("/admin/store-workspace-trace-v2/submission/{}", submission_id.0),
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

}

