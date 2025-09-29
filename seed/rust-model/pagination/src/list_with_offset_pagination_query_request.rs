use crate::inline_users_inline_users_order::Order;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListWithOffsetPaginationQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub page: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub per_page: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub order: Option<Order>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub starting_after: Option<String>,
}