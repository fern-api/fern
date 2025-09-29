use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct GetConnectionQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fields: Option<String>,
}
