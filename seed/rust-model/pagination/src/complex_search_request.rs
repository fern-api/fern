pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ComplexSearchRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pagination: Option<ComplexStartingAfterPaging>,
    pub query: ComplexSearchRequestQuery,
}