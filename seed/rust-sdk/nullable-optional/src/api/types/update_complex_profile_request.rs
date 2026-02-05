pub use crate::prelude::*;

/// Request type for API operation
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct UpdateComplexProfileRequest {
    #[serde(rename = "nullableRole")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_role: Option<Option<UserRole>>,
    #[serde(rename = "nullableStatus")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_status: Option<Option<UserStatus>>,
    #[serde(rename = "nullableNotification")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_notification: Option<Option<NotificationMethod>>,
    #[serde(rename = "nullableSearchResult")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_search_result: Option<Option<SearchResult>>,
    #[serde(rename = "nullableArray")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_array: Option<Option<Vec<String>>>,
}
