pub use crate::prelude::*;

/// Query parameters for getResource
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct GetResourceQueryRequest {
    /// Include metadata in response
    #[serde(default)]
    pub include_metadata: bool,
    /// Response format
    #[serde(default)]
    pub format: String,
}

impl GetResourceQueryRequest {
    pub fn builder() -> GetResourceQueryRequestBuilder {
        <GetResourceQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GetResourceQueryRequestBuilder {
    include_metadata: Option<bool>,
    format: Option<String>,
}

impl GetResourceQueryRequestBuilder {
    pub fn include_metadata(mut self, value: bool) -> Self {
        self.include_metadata = Some(value);
        self
    }

    pub fn format(mut self, value: impl Into<String>) -> Self {
        self.format = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`GetResourceQueryRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`include_metadata`](GetResourceQueryRequestBuilder::include_metadata)
    /// - [`format`](GetResourceQueryRequestBuilder::format)
    pub fn build(self) -> Result<GetResourceQueryRequest, BuildError> {
        Ok(GetResourceQueryRequest {
            include_metadata: self.include_metadata.ok_or_else(|| BuildError::missing_field("include_metadata"))?,
            format: self.format.ok_or_else(|| BuildError::missing_field("format"))?,
        })
    }
}

