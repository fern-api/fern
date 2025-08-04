use crate::submission_request::SubmissionRequest;
use crate::invalid_request_cause::InvalidRequestCause;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct InvalidRequestResponse {
    pub request: SubmissionRequest,
    pub cause: InvalidRequestCause,
}