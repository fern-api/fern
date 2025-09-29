use crate::submission_submission_request::SubmissionRequest;
use crate::submission_invalid_request_cause::InvalidRequestCause;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InvalidRequestResponse {
    pub request: SubmissionRequest,
    pub cause: InvalidRequestCause,
}