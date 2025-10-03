pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct MultipleFilterSearchRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub operator: Option<MultipleFilterSearchRequestOperator>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<MultipleFilterSearchRequestValue>,
}