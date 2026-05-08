pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct TypesObjectWithRequiredField {
    #[serde(default)]
    pub string: String,
}

impl TypesObjectWithRequiredField {
    pub fn builder() -> TypesObjectWithRequiredFieldBuilder {
        <TypesObjectWithRequiredFieldBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TypesObjectWithRequiredFieldBuilder {
    string: Option<String>,
}

impl TypesObjectWithRequiredFieldBuilder {
    pub fn string(mut self, value: impl Into<String>) -> Self {
        self.string = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`TypesObjectWithRequiredField`].
    /// This method will fail if any of the following fields are not set:
    /// - [`string`](TypesObjectWithRequiredFieldBuilder::string)
    pub fn build(self) -> Result<TypesObjectWithRequiredField, BuildError> {
        Ok(TypesObjectWithRequiredField {
            string: self
                .string
                .ok_or_else(|| BuildError::missing_field("string"))?,
        })
    }
}
