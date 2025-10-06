pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ComplexMultipleFilterSearchRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub operator: Option<ComplexMultipleFilterSearchRequestOperator>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<ComplexMultipleFilterSearchRequestValue>,
}