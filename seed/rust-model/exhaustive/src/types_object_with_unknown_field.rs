pub use crate::prelude::*;

/// Tests that unknown/any values containing backslashes in map keys
/// are properly escaped in Go string literals.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct TypesObjectWithUnknownField {
    pub unknown: serde_json::Value,
}

impl TypesObjectWithUnknownField {
    pub fn builder() -> TypesObjectWithUnknownFieldBuilder {
        <TypesObjectWithUnknownFieldBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TypesObjectWithUnknownFieldBuilder {
    unknown: Option<serde_json::Value>,
}

impl TypesObjectWithUnknownFieldBuilder {
    pub fn unknown(mut self, value: serde_json::Value) -> Self {
        self.unknown = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TypesObjectWithUnknownField`].
    /// This method will fail if any of the following fields are not set:
    /// - [`unknown`](TypesObjectWithUnknownFieldBuilder::unknown)
    pub fn build(self) -> Result<TypesObjectWithUnknownField, BuildError> {
        Ok(TypesObjectWithUnknownField {
            unknown: self.unknown.ok_or_else(|| BuildError::missing_field("unknown"))?,
        })
    }
}
