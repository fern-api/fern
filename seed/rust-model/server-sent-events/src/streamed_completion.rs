use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct StreamedCompletion {
    pub delta: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tokens: Option<i32>,
}