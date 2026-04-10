pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct VariableValueType {
    pub r#type: VariableValueTypeType,
}

impl VariableValueType {
    pub fn builder() -> VariableValueTypeBuilder {
        <VariableValueTypeBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct VariableValueTypeBuilder {
    r#type: Option<VariableValueTypeType>,
}

impl VariableValueTypeBuilder {
    pub fn r#type(mut self, value: VariableValueTypeType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`VariableValueType`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](VariableValueTypeBuilder::r#type)
    pub fn build(self) -> Result<VariableValueType, BuildError> {
        Ok(VariableValueType {
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
