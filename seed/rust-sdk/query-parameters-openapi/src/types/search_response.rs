use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SearchResponse {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub results: Option<Vec<String>>,
}