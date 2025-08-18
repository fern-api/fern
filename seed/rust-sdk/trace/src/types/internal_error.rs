use crate::exception_info::ExceptionInfo;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct InternalError {
    #[serde(rename = "exceptionInfo")]
    pub exception_info: ExceptionInfo,
}