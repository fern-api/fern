pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct CreatePlaylistRequest {
    pub datetime: DateTime<Utc>,
    #[serde(rename = "optionalDatetime")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_datetime: Option<DateTime<Utc>>,
    pub body: PlaylistCreateRequest,
}
