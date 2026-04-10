pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct VariableTypeOne {
    pub r#type: VariableTypeOneType,
}

impl VariableTypeOne {
    pub fn builder() -> VariableTypeOneBuilder {
        <VariableTypeOneBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct VariableTypeOneBuilder {
    r#type: Option<VariableTypeOneType>,
}

impl VariableTypeOneBuilder {
    pub fn r#type(mut self, value: VariableTypeOneType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`VariableTypeOne`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](VariableTypeOneBuilder::r#type)
    pub fn build(self) -> Result<VariableTypeOne, BuildError> {
        Ok(VariableTypeOne {
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
