pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Page {
    /// The current page
    pub page: i64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next: Option<NextPage>,
    pub per_page: i64,
    pub total_page: i64,
}