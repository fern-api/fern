pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct GetPlaylistsQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub limit: Option<i64>,
    #[serde(rename = "otherField")]
    pub other_field: String,
    #[serde(rename = "multiLineDocs")]
    pub multi_line_docs: String,
    #[serde(rename = "optionalMultipleField")]
    pub optional_multiple_field: Vec<Option<String>>,
    #[serde(rename = "multipleField")]
    pub multiple_field: Vec<String>,
}
