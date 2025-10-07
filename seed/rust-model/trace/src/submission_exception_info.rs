pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SubmissionExceptionInfo {
    #[serde(rename = "exceptionType")]
    pub exception_type: String,
    #[serde(rename = "exceptionMessage")]
    pub exception_message: String,
    #[serde(rename = "exceptionStacktrace")]
    pub exception_stacktrace: String,
}