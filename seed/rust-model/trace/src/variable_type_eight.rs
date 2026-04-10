pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct VariableTypeEight {
    pub r#type: VariableTypeEightType,
}

impl VariableTypeEight {
    pub fn builder() -> VariableTypeEightBuilder {
        <VariableTypeEightBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct VariableTypeEightBuilder {
    r#type: Option<VariableTypeEightType>,
}

impl VariableTypeEightBuilder {
    pub fn r#type(mut self, value: VariableTypeEightType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`VariableTypeEight`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](VariableTypeEightBuilder::r#type)
    pub fn build(self) -> Result<VariableTypeEight, BuildError> {
        Ok(VariableTypeEight {
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
