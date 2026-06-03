pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct NullableStreamRequest {
    /// The prompt or query to complete.
    #[serde(default)]
    pub query: String,
    /// Whether to stream the response. This field is nullable (OAS 3.1 type array), which previously caused the const literal to be overwritten by the nullable type during spread in the importer.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stream: Option<bool>,
}

impl NullableStreamRequest {
    pub fn builder() -> NullableStreamRequestBuilder {
        <NullableStreamRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct NullableStreamRequestBuilder {
    query: Option<String>,
    stream: Option<bool>,
}

impl NullableStreamRequestBuilder {
    pub fn query(mut self, value: impl Into<String>) -> Self {
        self.query = Some(value.into());
        self
    }

    pub fn stream(mut self, value: bool) -> Self {
        self.stream = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`NullableStreamRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`query`](NullableStreamRequestBuilder::query)
    pub fn build(self) -> Result<NullableStreamRequest, BuildError> {
        Ok(NullableStreamRequest {
            query: self.query.ok_or_else(|| BuildError::missing_field("query"))?,
            stream: self.stream,
        })
    }
}
