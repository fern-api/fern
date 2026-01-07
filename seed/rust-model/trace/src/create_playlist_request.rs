pub use crate::prelude::*;

/// Request for createPlaylist (body + query parameters)
///
/// Request type for the CreatePlaylistRequest operation.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct CreatePlaylistRequest {
    #[serde(with = "crate::core::flexible_datetime::offset")]
    pub datetime: DateTime<FixedOffset>,
    #[serde(rename = "optionalDatetime")]
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::flexible_datetime::offset::option")]
    pub optional_datetime: Option<DateTime<FixedOffset>>,
    pub body: PlaylistCreateRequest,
}
