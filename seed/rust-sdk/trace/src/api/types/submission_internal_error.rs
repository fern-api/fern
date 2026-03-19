pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct InternalError {
    #[serde(rename = "exceptionInfo")]
    #[serde(default)]
    pub exception_info: ExceptionInfo,
}
