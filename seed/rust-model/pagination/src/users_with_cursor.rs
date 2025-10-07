pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct WithCursor2 {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cursor: Option<String>,
}