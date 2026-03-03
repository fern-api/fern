pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Metadata {
    #[serde(rename = "createdAt")]
    #[serde(with = "crate::core::flexible_datetime::offset")]
    pub created_at: DateTime<FixedOffset>,
    #[serde(rename = "updatedAt")]
    #[serde(with = "crate::core::flexible_datetime::offset")]
    pub updated_at: DateTime<FixedOffset>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub avatar: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub activated: Option<Option<bool>>,
    pub status: Status,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub values: Option<HashMap<String, Option<Option<String>>>>,
}
