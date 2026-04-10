pub use crate::prelude::*;

/// Query parameters for getUserById
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct GetUserByIdQueryRequest {
    /// Comma-separated list of fields to include or exclude
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fields: Option<String>,
    /// true to include the fields specified, false to exclude them
    #[serde(skip_serializing_if = "Option::is_none")]
    pub include_fields: Option<bool>,
}

impl GetUserByIdQueryRequest {
    pub fn builder() -> GetUserByIdQueryRequestBuilder {
        <GetUserByIdQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GetUserByIdQueryRequestBuilder {
    fields: Option<String>,
    include_fields: Option<bool>,
}

impl GetUserByIdQueryRequestBuilder {
    pub fn fields(mut self, value: impl Into<String>) -> Self {
        self.fields = Some(value.into());
        self
    }

    pub fn include_fields(mut self, value: bool) -> Self {
        self.include_fields = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`GetUserByIdQueryRequest`].
    pub fn build(self) -> Result<GetUserByIdQueryRequest, BuildError> {
        Ok(GetUserByIdQueryRequest {
            fields: self.fields,
            include_fields: self.include_fields,
        })
    }
}

