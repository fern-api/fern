pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct TypesDoubleOptional {
    #[serde(rename = "optionalAlias")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_alias: Option<TypesOptionalAlias>,
}

impl TypesDoubleOptional {
    pub fn builder() -> TypesDoubleOptionalBuilder {
        <TypesDoubleOptionalBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TypesDoubleOptionalBuilder {
    optional_alias: Option<TypesOptionalAlias>,
}

impl TypesDoubleOptionalBuilder {
    pub fn optional_alias(mut self, value: TypesOptionalAlias) -> Self {
        self.optional_alias = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TypesDoubleOptional`].
    pub fn build(self) -> Result<TypesDoubleOptional, BuildError> {
        Ok(TypesDoubleOptional {
            optional_alias: self.optional_alias,
        })
    }
}
