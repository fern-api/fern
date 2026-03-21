pub use crate::prelude::*;

/// Query parameters for search
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SearchQueryRequest {
    #[serde(default)]
    pub limit: i64,
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub date: NaiveDate,
    #[serde(default)]
    #[serde(with = "crate::core::flexible_datetime::offset")]
    pub deadline: DateTime<FixedOffset>,
    #[serde(default)]
    pub bytes: String,
    #[serde(default)]
    pub user: User,
    #[serde(rename = "userList")]
    #[serde(default)]
    pub user_list: Vec<Option<User>>,
    #[serde(rename = "optionalDeadline")]
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::flexible_datetime::offset::option")]
    pub optional_deadline: Option<DateTime<FixedOffset>>,
    #[serde(rename = "keyValue")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub key_value: Option<HashMap<String, String>>,
    #[serde(rename = "optionalString")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_string: Option<String>,
    #[serde(rename = "nestedUser")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nested_user: Option<NestedUser>,
    #[serde(rename = "optionalUser")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_user: Option<User>,
    #[serde(rename = "excludeUser")]
    #[serde(default)]
    pub exclude_user: Vec<Option<User>>,
    #[serde(default)]
    pub filter: Vec<Option<String>>,
    /// List of tags. Serialized as a comma-separated list.
    #[serde(default)]
    pub tags: Vec<Option<String>>,
    /// Optional list of tags. Serialized as a comma-separated list.
    #[serde(rename = "optionalTags")]
    #[serde(default)]
    pub optional_tags: Vec<Option<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub neighbor: Option<SearchRequestNeighbor>,
    #[serde(rename = "neighborRequired")]
    pub neighbor_required: SearchRequestNeighborRequired,
}
