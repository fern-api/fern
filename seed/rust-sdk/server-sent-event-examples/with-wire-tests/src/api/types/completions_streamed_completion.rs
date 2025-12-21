pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct StreamedCompletion {
    pub delta: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tokens: Option<i64>,
}
