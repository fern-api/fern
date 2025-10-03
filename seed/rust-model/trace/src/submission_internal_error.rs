pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct InternalError {
    #[serde(rename = "exceptionInfo")]
    pub exception_info: ExceptionInfo,
}