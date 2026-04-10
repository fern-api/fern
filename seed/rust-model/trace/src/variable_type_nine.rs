pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct VariableTypeNine {
    pub r#type: VariableTypeNineType,
}

impl VariableTypeNine {
    pub fn builder() -> VariableTypeNineBuilder {
        <VariableTypeNineBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct VariableTypeNineBuilder {
    r#type: Option<VariableTypeNineType>,
}

impl VariableTypeNineBuilder {
    pub fn r#type(mut self, value: VariableTypeNineType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`VariableTypeNine`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](VariableTypeNineBuilder::r#type)
    pub fn build(self) -> Result<VariableTypeNine, BuildError> {
        Ok(VariableTypeNine {
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
