pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct InvalidRequestResponse {
    pub request: SubmissionRequest,
    pub cause: InvalidRequestCause,
}