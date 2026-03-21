pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ErrorEvent {
    #[serde(rename = "errorCode")]
    #[serde(default)]
    pub error_code: i64,
    #[serde(rename = "errorMessage")]
    #[serde(default)]
    pub error_message: String,
}