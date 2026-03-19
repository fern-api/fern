pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct StreamedCompletion {
    #[serde(default)]
    pub delta: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tokens: Option<i64>,
}
