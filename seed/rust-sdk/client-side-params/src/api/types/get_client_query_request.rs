pub use crate::prelude::*;

/// Query parameters for getClient
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct GetClientQueryRequest {
    /// Comma-separated list of fields to include
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fields: Option<String>,
    /// Whether specified fields are included or excluded
    #[serde(skip_serializing_if = "Option::is_none")]
    pub include_fields: Option<bool>,
}

impl GetClientQueryRequest {
    pub fn builder() -> GetClientQueryRequestBuilder {
        <GetClientQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GetClientQueryRequestBuilder {
    fields: Option<String>,
    include_fields: Option<bool>,
}

impl GetClientQueryRequestBuilder {
    pub fn fields(mut self, value: impl Into<String>) -> Self {
        self.fields = Some(value.into());
        self
    }

    pub fn include_fields(mut self, value: bool) -> Self {
        self.include_fields = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`GetClientQueryRequest`].
    pub fn build(self) -> Result<GetClientQueryRequest, BuildError> {
        Ok(GetClientQueryRequest {
            fields: self.fields,
            include_fields: self.include_fields,
        })
    }
}
