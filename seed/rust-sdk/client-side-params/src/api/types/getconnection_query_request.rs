pub use crate::prelude::*;

/// Query parameters for getconnection
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct GetconnectionQueryRequest {
    /// Comma-separated list of fields to include
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fields: Option<String>,
}

impl GetconnectionQueryRequest {
    pub fn builder() -> GetconnectionQueryRequestBuilder {
        <GetconnectionQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GetconnectionQueryRequestBuilder {
    fields: Option<String>,
}

impl GetconnectionQueryRequestBuilder {
    pub fn fields(mut self, value: impl Into<String>) -> Self {
        self.fields = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`GetconnectionQueryRequest`].
    pub fn build(self) -> Result<GetconnectionQueryRequest, BuildError> {
        Ok(GetconnectionQueryRequest {
            fields: self.fields,
        })
    }
}
