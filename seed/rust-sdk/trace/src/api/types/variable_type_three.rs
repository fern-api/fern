pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct VariableTypeThree {
    pub r#type: VariableTypeThreeType,
}

impl VariableTypeThree {
    pub fn builder() -> VariableTypeThreeBuilder {
        <VariableTypeThreeBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct VariableTypeThreeBuilder {
    r#type: Option<VariableTypeThreeType>,
}

impl VariableTypeThreeBuilder {
    pub fn r#type(mut self, value: VariableTypeThreeType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`VariableTypeThree`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](VariableTypeThreeBuilder::r#type)
    pub fn build(self) -> Result<VariableTypeThree, BuildError> {
        Ok(VariableTypeThree {
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
