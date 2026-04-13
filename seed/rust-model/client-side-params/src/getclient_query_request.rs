pub use crate::prelude::*;

/// Query parameters for getclient
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct GetclientQueryRequest {
    /// Comma-separated list of fields to include
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fields: Option<String>,
    /// Whether specified fields are included or excluded
    #[serde(skip_serializing_if = "Option::is_none")]
    pub include_fields: Option<bool>,
}

impl GetclientQueryRequest {
    pub fn builder() -> GetclientQueryRequestBuilder {
        <GetclientQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GetclientQueryRequestBuilder {
    fields: Option<String>,
    include_fields: Option<bool>,
}

impl GetclientQueryRequestBuilder {
    pub fn fields(mut self, value: impl Into<String>) -> Self {
        self.fields = Some(value.into());
        self
    }

    pub fn include_fields(mut self, value: bool) -> Self {
        self.include_fields = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`GetclientQueryRequest`].
    pub fn build(self) -> Result<GetclientQueryRequest, BuildError> {
        Ok(GetclientQueryRequest {
            fields: self.fields,
            include_fields: self.include_fields,
        })
    }
}

