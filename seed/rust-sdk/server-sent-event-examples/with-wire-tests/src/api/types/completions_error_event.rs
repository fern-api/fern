pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ErrorEvent {
    #[serde(default)]
    pub error: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub code: Option<i64>,
}
