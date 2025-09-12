use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SearchResponse {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub results: Option<Vec<String>>,
}