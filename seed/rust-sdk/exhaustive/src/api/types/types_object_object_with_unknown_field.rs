pub use crate::prelude::*;

/// Tests that unknown/any values containing backslashes in map keys
/// are properly escaped in Go string literals.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct ObjectWithUnknownField {
    pub unknown: serde_json::Value,
}

impl ObjectWithUnknownField {
    pub fn builder() -> ObjectWithUnknownFieldBuilder {
        <ObjectWithUnknownFieldBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ObjectWithUnknownFieldBuilder {
    unknown: Option<serde_json::Value>,
}

impl ObjectWithUnknownFieldBuilder {
    pub fn unknown(mut self, value: serde_json::Value) -> Self {
        self.unknown = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ObjectWithUnknownField`].
    /// This method will fail if any of the following fields are not set:
    /// - [`unknown`](ObjectWithUnknownFieldBuilder::unknown)
    pub fn build(self) -> Result<ObjectWithUnknownField, BuildError> {
        Ok(ObjectWithUnknownField {
            unknown: self
                .unknown
                .ok_or_else(|| BuildError::missing_field("unknown"))?,
        })
    }
}
