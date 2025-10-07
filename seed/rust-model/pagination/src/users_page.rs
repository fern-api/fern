pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Page2 {
    /// The current page
    pub page: i64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next: Option<NextPage2>,
    pub per_page: i64,
    pub total_page: i64,
}