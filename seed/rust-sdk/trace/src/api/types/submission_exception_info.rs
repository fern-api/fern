pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ExceptionInfo {
    #[serde(rename = "exceptionType")]
    #[serde(default)]
    pub exception_type: String,
    #[serde(rename = "exceptionMessage")]
    #[serde(default)]
    pub exception_message: String,
    #[serde(rename = "exceptionStacktrace")]
    #[serde(default)]
    pub exception_stacktrace: String,
}
