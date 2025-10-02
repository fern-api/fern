pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ListResourcesQueryRequest {
    pub page: i64,
    pub per_page: i64,
    pub sort: String,
    pub order: String,
    pub include_totals: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fields: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub search: Option<String>,
}
