pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct VariableTypeTwo {
    pub r#type: VariableTypeTwoType,
}

impl VariableTypeTwo {
    pub fn builder() -> VariableTypeTwoBuilder {
        <VariableTypeTwoBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct VariableTypeTwoBuilder {
    r#type: Option<VariableTypeTwoType>,
}

impl VariableTypeTwoBuilder {
    pub fn r#type(mut self, value: VariableTypeTwoType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`VariableTypeTwo`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](VariableTypeTwoBuilder::r#type)
    pub fn build(self) -> Result<VariableTypeTwo, BuildError> {
        Ok(VariableTypeTwo {
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
