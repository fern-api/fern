pub use crate::prelude::*;

/// Query parameters for getMetadata
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct GetMetadataQueryRequest {
    #[serde(default)]
    pub id: Id,
}

impl GetMetadataQueryRequest {
    pub fn builder() -> GetMetadataQueryRequestBuilder {
        <GetMetadataQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GetMetadataQueryRequestBuilder {
    id: Option<Id>,
}

impl GetMetadataQueryRequestBuilder {
    pub fn id(mut self, value: Id) -> Self {
        self.id = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`GetMetadataQueryRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](GetMetadataQueryRequestBuilder::id)
    pub fn build(self) -> Result<GetMetadataQueryRequest, BuildError> {
        Ok(GetMetadataQueryRequest {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
        })
    }
}

