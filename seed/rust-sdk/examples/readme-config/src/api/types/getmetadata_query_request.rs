pub use crate::prelude::*;

/// Query parameters for getmetadata
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct GetmetadataQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub shallow: Option<bool>,
    #[serde(default)]
    pub tag: Vec<Option<String>>,
}

impl GetmetadataQueryRequest {
    pub fn builder() -> GetmetadataQueryRequestBuilder {
        <GetmetadataQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GetmetadataQueryRequestBuilder {
    shallow: Option<bool>,
    tag: Option<Vec<Option<String>>>,
}

impl GetmetadataQueryRequestBuilder {
    pub fn shallow(mut self, value: bool) -> Self {
        self.shallow = Some(value);
        self
    }

    pub fn tag(mut self, value: Vec<Option<String>>) -> Self {
        self.tag = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`GetmetadataQueryRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`tag`](GetmetadataQueryRequestBuilder::tag)
    pub fn build(self) -> Result<GetmetadataQueryRequest, BuildError> {
        Ok(GetmetadataQueryRequest {
            shallow: self.shallow,
            tag: self.tag.ok_or_else(|| BuildError::missing_field("tag"))?,
        })
    }
}
