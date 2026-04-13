pub use crate::prelude::*;

/// Query parameters for user_events_metadata_getMetadata
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UserEventsMetadataGetMetadataQueryRequest {
    #[serde(default)]
    pub id: Id,
}

impl UserEventsMetadataGetMetadataQueryRequest {
    pub fn builder() -> UserEventsMetadataGetMetadataQueryRequestBuilder {
        <UserEventsMetadataGetMetadataQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UserEventsMetadataGetMetadataQueryRequestBuilder {
    id: Option<Id>,
}

impl UserEventsMetadataGetMetadataQueryRequestBuilder {
    pub fn id(mut self, value: Id) -> Self {
        self.id = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UserEventsMetadataGetMetadataQueryRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](UserEventsMetadataGetMetadataQueryRequestBuilder::id)
    pub fn build(self) -> Result<UserEventsMetadataGetMetadataQueryRequest, BuildError> {
        Ok(UserEventsMetadataGetMetadataQueryRequest {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
        })
    }
}
