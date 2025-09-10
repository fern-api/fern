use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Page {
    pub page: i32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next: Option<NextPage>,
    pub per_page: i32,
    pub total_page: i32,
}