pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct VariableTypeZero {
    pub r#type: VariableTypeZeroType,
}

impl VariableTypeZero {
    pub fn builder() -> VariableTypeZeroBuilder {
        <VariableTypeZeroBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct VariableTypeZeroBuilder {
    r#type: Option<VariableTypeZeroType>,
}

impl VariableTypeZeroBuilder {
    pub fn r#type(mut self, value: VariableTypeZeroType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`VariableTypeZero`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](VariableTypeZeroBuilder::r#type)
    pub fn build(self) -> Result<VariableTypeZero, BuildError> {
        Ok(VariableTypeZero {
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
