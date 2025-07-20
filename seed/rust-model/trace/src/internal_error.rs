use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct InternalError {
    #[serde(rename = "exceptionInfo")]
    pub exception_info: ExceptionInfo,
}