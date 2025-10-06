pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SubmissionInvalidRequestResponse {
    pub request: SubmissionSubmissionRequest,
    pub cause: SubmissionInvalidRequestCause,
}
