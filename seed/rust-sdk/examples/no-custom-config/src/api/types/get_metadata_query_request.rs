pub use crate::prelude::*;

/// Query parameters for getMetadata
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct GetMetadataQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub shallow: Option<bool>,
    #[serde(default)]
    pub tag: Vec<Option<String>>,
}

impl GetMetadataQueryRequest {
    pub fn builder() -> GetMetadataQueryRequestBuilder {
        <GetMetadataQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GetMetadataQueryRequestBuilder {
    shallow: Option<bool>,
    tag: Option<Vec<Option<String>>>,
}

impl GetMetadataQueryRequestBuilder {
    pub fn shallow(mut self, value: bool) -> Self {
        self.shallow = Some(value);
        self
    }

    pub fn tag(mut self, value: Vec<Option<String>>) -> Self {
        self.tag = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`GetMetadataQueryRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`tag`](GetMetadataQueryRequestBuilder::tag)
    pub fn build(self) -> Result<GetMetadataQueryRequest, BuildError> {
        Ok(GetMetadataQueryRequest {
            shallow: self.shallow,
            tag: self.tag.ok_or_else(|| BuildError::missing_field("tag"))?,
        })
    }
}
