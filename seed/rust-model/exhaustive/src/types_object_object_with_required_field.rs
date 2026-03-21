pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ObjectWithRequiredField {
    #[serde(default)]
    pub string: String,
}

impl ObjectWithRequiredField {
    pub fn builder() -> ObjectWithRequiredFieldBuilder {
        ObjectWithRequiredFieldBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ObjectWithRequiredFieldBuilder {
    string: Option<String>,
}

impl ObjectWithRequiredFieldBuilder {
    pub fn string(mut self, value: impl Into<String>) -> Self {
        self.string = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`ObjectWithRequiredField`].
    /// This method will fail if any of the following fields are not set:
    /// - [`string`](ObjectWithRequiredFieldBuilder::string)
    pub fn build(self) -> Result<ObjectWithRequiredField, BuildError> {
        Ok(ObjectWithRequiredField {
            string: self.string.ok_or_else(|| BuildError::missing_field("string"))?,
        })
    }
}
