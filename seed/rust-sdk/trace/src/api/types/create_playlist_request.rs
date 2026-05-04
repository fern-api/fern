pub use crate::prelude::*;

/// Request for createPlaylist (body + query parameters)
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct CreatePlaylistRequest {
    #[serde(skip_serializing)]
    #[serde(default)]
    pub datetime: DateTime<FixedOffset>,
    #[serde(rename = "optionalDatetime")]
    #[serde(skip_serializing)]
    pub optional_datetime: Option<DateTime<FixedOffset>>,
    #[serde(default)]
    pub body: PlaylistCreateRequest,
}

impl CreatePlaylistRequest {
    pub fn builder() -> CreatePlaylistRequestBuilder {
        <CreatePlaylistRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CreatePlaylistRequestBuilder {
    datetime: Option<DateTime<FixedOffset>>,
    optional_datetime: Option<DateTime<FixedOffset>>,
    body: Option<PlaylistCreateRequest>,
}

impl CreatePlaylistRequestBuilder {
    pub fn datetime(mut self, value: DateTime<FixedOffset>) -> Self {
        self.datetime = Some(value);
        self
    }

    pub fn optional_datetime(mut self, value: DateTime<FixedOffset>) -> Self {
        self.optional_datetime = Some(value);
        self
    }

    pub fn body(mut self, value: PlaylistCreateRequest) -> Self {
        self.body = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`CreatePlaylistRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`datetime`](CreatePlaylistRequestBuilder::datetime)
    /// - [`body`](CreatePlaylistRequestBuilder::body)
    pub fn build(self) -> Result<CreatePlaylistRequest, BuildError> {
        Ok(CreatePlaylistRequest {
            datetime: self
                .datetime
                .ok_or_else(|| BuildError::missing_field("datetime"))?,
            optional_datetime: self.optional_datetime,
            body: self.body.ok_or_else(|| BuildError::missing_field("body"))?,
        })
    }
}
