pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct SearchResponse {
    #[serde(default)]
    pub results: Vec<Resource>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub total: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next_offset: Option<i64>,
}