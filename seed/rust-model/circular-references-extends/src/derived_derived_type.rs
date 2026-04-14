pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct DerivedType {
    #[serde(flatten)]
    pub base_type_fields: BaseType,
    #[serde(default)]
    pub derived_name: String,
}

impl DerivedType {
    pub fn builder() -> DerivedTypeBuilder {
        <DerivedTypeBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DerivedTypeBuilder {
    base_type_fields: Option<BaseType>,
    derived_name: Option<String>,
}

impl DerivedTypeBuilder {
    pub fn base_type_fields(mut self, value: BaseType) -> Self {
        self.base_type_fields = Some(value);
        self
    }

    pub fn derived_name(mut self, value: impl Into<String>) -> Self {
        self.derived_name = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`DerivedType`].
    /// This method will fail if any of the following fields are not set:
    /// - [`base_type_fields`](DerivedTypeBuilder::base_type_fields)
    /// - [`derived_name`](DerivedTypeBuilder::derived_name)
    pub fn build(self) -> Result<DerivedType, BuildError> {
        Ok(DerivedType {
            base_type_fields: self.base_type_fields.ok_or_else(|| BuildError::missing_field("base_type_fields"))?,
            derived_name: self.derived_name.ok_or_else(|| BuildError::missing_field("derived_name"))?,
        })
    }
}
