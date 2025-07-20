use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct UsernamePage {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub after: Option<String>,
    pub data: Vec<String>,
}