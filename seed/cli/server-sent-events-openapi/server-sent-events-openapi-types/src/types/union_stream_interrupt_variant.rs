pub use crate::prelude::*;

/// Cancels the current operation. Inherits stream_response from base.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UnionStreamInterruptVariant {
    #[serde(flatten)]
    pub union_stream_request_base_fields: UnionStreamRequestBase,
}

impl UnionStreamInterruptVariant {
    pub fn builder() -> UnionStreamInterruptVariantBuilder {
        <UnionStreamInterruptVariantBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UnionStreamInterruptVariantBuilder {
    union_stream_request_base_fields: Option<UnionStreamRequestBase>,
}

impl UnionStreamInterruptVariantBuilder {
    pub fn union_stream_request_base_fields(mut self, value: UnionStreamRequestBase) -> Self {
        self.union_stream_request_base_fields = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UnionStreamInterruptVariant`].
    /// This method will fail if any of the following fields are not set:
    /// - [`union_stream_request_base_fields`](UnionStreamInterruptVariantBuilder::union_stream_request_base_fields)
    pub fn build(self) -> Result<UnionStreamInterruptVariant, BuildError> {
        Ok(UnionStreamInterruptVariant {
            union_stream_request_base_fields: self.union_stream_request_base_fields.ok_or_else(|| BuildError::missing_field("union_stream_request_base_fields"))?,
        })
    }
}
