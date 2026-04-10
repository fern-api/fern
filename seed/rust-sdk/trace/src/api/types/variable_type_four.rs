pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct VariableTypeFour {
    pub r#type: VariableTypeFourType,
}

impl VariableTypeFour {
    pub fn builder() -> VariableTypeFourBuilder {
        <VariableTypeFourBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct VariableTypeFourBuilder {
    r#type: Option<VariableTypeFourType>,
}

impl VariableTypeFourBuilder {
    pub fn r#type(mut self, value: VariableTypeFourType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`VariableTypeFour`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](VariableTypeFourBuilder::r#type)
    pub fn build(self) -> Result<VariableTypeFour, BuildError> {
        Ok(VariableTypeFour {
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
