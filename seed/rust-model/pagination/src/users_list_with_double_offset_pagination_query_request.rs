pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct UsersListWithDoubleOffsetPaginationQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub page: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub per_page: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub order: Option<Order2>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub starting_after: Option<String>,
}
