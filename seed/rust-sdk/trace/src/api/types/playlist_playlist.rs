pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Playlist {
    #[serde(flatten)]
    pub playlist_create_request_fields: PlaylistCreateRequest,
    #[serde(default)]
    pub playlist_id: PlaylistId,
    #[serde(rename = "owner-id")]
    #[serde(default)]
    pub owner_id: UserId,
}

impl Playlist {
    pub fn builder() -> PlaylistBuilder {
        PlaylistBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct PlaylistBuilder {
    playlist_create_request_fields: Option<PlaylistCreateRequest>,
    playlist_id: Option<PlaylistId>,
    owner_id: Option<UserId>,
}

impl PlaylistBuilder {
    pub fn playlist_create_request_fields(mut self, value: PlaylistCreateRequest) -> Self {
        self.playlist_create_request_fields = Some(value);
        self
    }

    pub fn playlist_id(mut self, value: PlaylistId) -> Self {
        self.playlist_id = Some(value);
        self
    }

    pub fn owner_id(mut self, value: UserId) -> Self {
        self.owner_id = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Playlist`].
    /// This method will fail if any of the following fields are not set:
    /// - [`playlist_create_request_fields`](PlaylistBuilder::playlist_create_request_fields)
    /// - [`playlist_id`](PlaylistBuilder::playlist_id)
    /// - [`owner_id`](PlaylistBuilder::owner_id)
    pub fn build(self) -> Result<Playlist, BuildError> {
        Ok(Playlist {
            playlist_create_request_fields: self
                .playlist_create_request_fields
                .ok_or_else(|| BuildError::missing_field("playlist_create_request_fields"))?,
            playlist_id: self
                .playlist_id
                .ok_or_else(|| BuildError::missing_field("playlist_id"))?,
            owner_id: self
                .owner_id
                .ok_or_else(|| BuildError::missing_field("owner_id"))?,
        })
    }
}
