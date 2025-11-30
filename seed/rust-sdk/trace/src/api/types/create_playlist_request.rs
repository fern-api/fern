pub use crate::prelude::*;

/// Request for createPlaylist (body + query parameters)
///
/// Request type for the CreatePlaylistRequest operation.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct CreatePlaylistRequest {
    pub datetime: DateTime<Utc>,
    #[serde(rename = "optionalDatetime")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_datetime: Option<DateTime<Utc>>,
    pub body: PlaylistCreateRequest,
}
