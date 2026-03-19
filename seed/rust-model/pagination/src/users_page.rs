pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Page2 {
    /// The current page
    #[serde(default)]
    pub page: i64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next: Option<NextPage2>,
    #[serde(default)]
    pub per_page: i64,
    #[serde(default)]
    pub total_page: i64,
}