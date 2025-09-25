use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct GetPlaylistsQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub limit: Option<i32>,
    #[serde(rename = "otherField")]
    pub other_field: String,
    #[serde(rename = "multiLineDocs")]
    pub multi_line_docs: String,
    #[serde(rename = "optionalMultipleField")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_multiple_field: Option<String>,
    #[serde(rename = "multipleField")]
    pub multiple_field: String,
}