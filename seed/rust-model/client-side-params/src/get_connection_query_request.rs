pub use crate::prelude::*;

/// Query parameters for getConnection
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct GetConnectionQueryRequest {
    /// Comma-separated list of fields to include
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fields: Option<String>,
}

impl GetConnectionQueryRequest {
    pub fn builder() -> GetConnectionQueryRequestBuilder {
        <GetConnectionQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GetConnectionQueryRequestBuilder {
    fields: Option<String>,
}

impl GetConnectionQueryRequestBuilder {
    pub fn fields(mut self, value: impl Into<String>) -> Self {
        self.fields = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`GetConnectionQueryRequest`].
    pub fn build(self) -> Result<GetConnectionQueryRequest, BuildError> {
        Ok(GetConnectionQueryRequest {
            fields: self.fields,
        })
    }
}

