pub use crate::prelude::*;

/// Query parameters for getPlaylists
///
/// Request type for the GetPlaylistsQueryRequest operation.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct GetPlaylistsQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub limit: Option<i64>,
    /// i'm another field
    #[serde(rename = "otherField")]
    pub other_field: String,
    /// I'm a multiline
    /// description
    #[serde(rename = "multiLineDocs")]
    pub multi_line_docs: String,
    #[serde(rename = "optionalMultipleField")]
    pub optional_multiple_field: Vec<Option<String>>,
    #[serde(rename = "multipleField")]
    pub multiple_field: Vec<String>,
}
