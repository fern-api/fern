use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct WithPage {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub page: Option<i32>,
}