pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SubmissionInternalError {
    #[serde(rename = "exceptionInfo")]
    pub exception_info: SubmissionExceptionInfo,
}
