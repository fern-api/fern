pub use crate::prelude::*;

/// Requests compaction of history. Inherits stream_response from base and adds compact-specific fields.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UnionStreamCompactVariant {
    #[serde(flatten)]
    pub union_stream_request_base_fields: UnionStreamRequestBase,
    /// Compact data payload.
    #[serde(default)]
    pub data: String,
}

impl UnionStreamCompactVariant {
    pub fn builder() -> UnionStreamCompactVariantBuilder {
        <UnionStreamCompactVariantBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UnionStreamCompactVariantBuilder {
    union_stream_request_base_fields: Option<UnionStreamRequestBase>,
    data: Option<String>,
}

impl UnionStreamCompactVariantBuilder {
    pub fn union_stream_request_base_fields(mut self, value: UnionStreamRequestBase) -> Self {
        self.union_stream_request_base_fields = Some(value);
        self
    }

    pub fn data(mut self, value: impl Into<String>) -> Self {
        self.data = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`UnionStreamCompactVariant`].
    /// This method will fail if any of the following fields are not set:
    /// - [`union_stream_request_base_fields`](UnionStreamCompactVariantBuilder::union_stream_request_base_fields)
    /// - [`data`](UnionStreamCompactVariantBuilder::data)
    pub fn build(self) -> Result<UnionStreamCompactVariant, BuildError> {
        Ok(UnionStreamCompactVariant {
            union_stream_request_base_fields: self
                .union_stream_request_base_fields
                .ok_or_else(|| BuildError::missing_field("union_stream_request_base_fields"))?,
            data: self.data.ok_or_else(|| BuildError::missing_field("data"))?,
        })
    }
}
