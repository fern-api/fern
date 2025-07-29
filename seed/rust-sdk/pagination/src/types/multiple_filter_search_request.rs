use crate::multiple_filter_search_request_operator::MultipleFilterSearchRequestOperator;
use crate::multiple_filter_search_request_value::MultipleFilterSearchRequestValue;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct MultipleFilterSearchRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub operator: Option<MultipleFilterSearchRequestOperator>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<MultipleFilterSearchRequestValue>,
}