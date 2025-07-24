use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct InvalidRequestResponse {
    pub request: SubmissionRequest,
    pub cause: InvalidRequestCause,
}