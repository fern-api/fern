use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ExceptionInfo {
    #[serde(rename = "exceptionType")]
    pub exception_type: String,
    #[serde(rename = "exceptionMessage")]
    pub exception_message: String,
    #[serde(rename = "exceptionStacktrace")]
    pub exception_stacktrace: String,
}