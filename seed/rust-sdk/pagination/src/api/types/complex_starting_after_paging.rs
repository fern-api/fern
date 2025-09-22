use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct StartingAfterPaging {
    pub per_page: i32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub starting_after: Option<String>,
}