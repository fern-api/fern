pub use crate::prelude::*;

/// A user input message. Inherits stream_response from base via allOf.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UnionStreamMessageVariant {
    #[serde(flatten)]
    pub union_stream_request_base_fields: UnionStreamRequestBase,
    /// The message content.
    #[serde(default)]
    pub message: String,
}

impl UnionStreamMessageVariant {
    pub fn builder() -> UnionStreamMessageVariantBuilder {
        <UnionStreamMessageVariantBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UnionStreamMessageVariantBuilder {
    union_stream_request_base_fields: Option<UnionStreamRequestBase>,
    message: Option<String>,
}

impl UnionStreamMessageVariantBuilder {
    pub fn union_stream_request_base_fields(mut self, value: UnionStreamRequestBase) -> Self {
        self.union_stream_request_base_fields = Some(value);
        self
    }

    pub fn message(mut self, value: impl Into<String>) -> Self {
        self.message = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`UnionStreamMessageVariant`].
    /// This method will fail if any of the following fields are not set:
    /// - [`union_stream_request_base_fields`](UnionStreamMessageVariantBuilder::union_stream_request_base_fields)
    /// - [`message`](UnionStreamMessageVariantBuilder::message)
    pub fn build(self) -> Result<UnionStreamMessageVariant, BuildError> {
        Ok(UnionStreamMessageVariant {
            union_stream_request_base_fields: self
                .union_stream_request_base_fields
                .ok_or_else(|| BuildError::missing_field("union_stream_request_base_fields"))?,
            message: self
                .message
                .ok_or_else(|| BuildError::missing_field("message"))?,
        })
    }
}
