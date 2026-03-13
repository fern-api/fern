pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ErrorEvent {
    #[serde(rename = "errorCode")]
    pub error_code: i64,
    #[serde(rename = "errorMessage")]
    pub error_message: String,
}