use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GetTraceResponsesPageRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub offset: Option<i32>,
}