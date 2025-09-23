use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ListUsersQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub limit: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub offset: Option<i32>,
    #[serde(rename = "includeDeleted")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub include_deleted: Option<bool>,
    #[serde(rename = "sortBy")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sort_by: Option<Option<String>>,
}
