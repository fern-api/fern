use crate::starting_after_paging::StartingAfterPaging;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CursorPages {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next: Option<StartingAfterPaging>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub page: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub per_page: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub total_pages: Option<i32>,
    pub r#type: String,
}