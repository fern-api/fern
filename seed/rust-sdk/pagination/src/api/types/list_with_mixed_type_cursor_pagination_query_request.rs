use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListWithMixedTypeCursorPaginationQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cursor: Option<String>,
}
