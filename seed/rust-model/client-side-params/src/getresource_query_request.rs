pub use crate::prelude::*;

/// Query parameters for getresource
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct GetresourceQueryRequest {
    /// Include metadata in response
    #[serde(default)]
    pub include_metadata: bool,
    /// Response format
    #[serde(default)]
    pub format: String,
}

impl GetresourceQueryRequest {
    pub fn builder() -> GetresourceQueryRequestBuilder {
        <GetresourceQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GetresourceQueryRequestBuilder {
    include_metadata: Option<bool>,
    format: Option<String>,
}

impl GetresourceQueryRequestBuilder {
    pub fn include_metadata(mut self, value: bool) -> Self {
        self.include_metadata = Some(value);
        self
    }

    pub fn format(mut self, value: impl Into<String>) -> Self {
        self.format = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`GetresourceQueryRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`include_metadata`](GetresourceQueryRequestBuilder::include_metadata)
    /// - [`format`](GetresourceQueryRequestBuilder::format)
    pub fn build(self) -> Result<GetresourceQueryRequest, BuildError> {
        Ok(GetresourceQueryRequest {
            include_metadata: self.include_metadata.ok_or_else(|| BuildError::missing_field("include_metadata"))?,
            format: self.format.ok_or_else(|| BuildError::missing_field("format"))?,
        })
    }
}

