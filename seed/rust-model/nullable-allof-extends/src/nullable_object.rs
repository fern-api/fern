pub use crate::prelude::*;

/// This schema has nullable:true at the top level.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct NullableObject {
    #[serde(rename = "nullableField")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_field: Option<String>,
}

impl NullableObject {
    pub fn builder() -> NullableObjectBuilder {
        <NullableObjectBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct NullableObjectBuilder {
    nullable_field: Option<String>,
}

impl NullableObjectBuilder {
    pub fn nullable_field(mut self, value: impl Into<String>) -> Self {
        self.nullable_field = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`NullableObject`].
    pub fn build(self) -> Result<NullableObject, BuildError> {
        Ok(NullableObject {
            nullable_field: self.nullable_field,
        })
    }
}
