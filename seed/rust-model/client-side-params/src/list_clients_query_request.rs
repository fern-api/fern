pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListClientsQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fields: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub include_fields: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub page: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub per_page: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub include_totals: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_global: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_first_party: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub app_type: Option<Vec<String>>,
}

