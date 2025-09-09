use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct WithCursor {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cursor: Option<String>,
}