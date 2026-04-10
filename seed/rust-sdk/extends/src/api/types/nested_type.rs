pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct NestedType {
    #[serde(flatten)]
    pub json_fields: Json,
    #[serde(default)]
    pub name: String,
}

impl NestedType {
    pub fn builder() -> NestedTypeBuilder {
        <NestedTypeBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct NestedTypeBuilder {
    json_fields: Option<Json>,
    name: Option<String>,
}

impl NestedTypeBuilder {
    pub fn json_fields(mut self, value: Json) -> Self {
        self.json_fields = Some(value);
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`NestedType`].
    /// This method will fail if any of the following fields are not set:
    /// - [`json_fields`](NestedTypeBuilder::json_fields)
    /// - [`name`](NestedTypeBuilder::name)
    pub fn build(self) -> Result<NestedType, BuildError> {
        Ok(NestedType {
            json_fields: self
                .json_fields
                .ok_or_else(|| BuildError::missing_field("json_fields"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
        })
    }
}
