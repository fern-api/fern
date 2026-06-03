pub use crate::prelude::*;

/// Base schema for union stream requests. Contains the stream_response field that is inherited by all oneOf variants via allOf. This schema is also referenced directly by a non-streaming endpoint to ensure it is not excluded from the context.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UnionStreamRequestBase {
    /// Whether to stream the response.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stream_response: Option<bool>,
    /// The input prompt.
    #[serde(default)]
    pub prompt: String,
}

impl UnionStreamRequestBase {
    pub fn builder() -> UnionStreamRequestBaseBuilder {
        <UnionStreamRequestBaseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UnionStreamRequestBaseBuilder {
    stream_response: Option<bool>,
    prompt: Option<String>,
}

impl UnionStreamRequestBaseBuilder {
    pub fn stream_response(mut self, value: bool) -> Self {
        self.stream_response = Some(value);
        self
    }

    pub fn prompt(mut self, value: impl Into<String>) -> Self {
        self.prompt = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`UnionStreamRequestBase`].
    /// This method will fail if any of the following fields are not set:
    /// - [`prompt`](UnionStreamRequestBaseBuilder::prompt)
    pub fn build(self) -> Result<UnionStreamRequestBase, BuildError> {
        Ok(UnionStreamRequestBase {
            stream_response: self.stream_response,
            prompt: self.prompt.ok_or_else(|| BuildError::missing_field("prompt"))?,
        })
    }
}
