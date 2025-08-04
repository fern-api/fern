use crate::single_filter_search_request_operator::SingleFilterSearchRequestOperator;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SingleFilterSearchRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub field: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub operator: Option<SingleFilterSearchRequestOperator>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<String>,
}