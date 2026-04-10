pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct VariableValueOne {
    pub r#type: VariableValueOneType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<bool>,
}

impl VariableValueOne {
    pub fn builder() -> VariableValueOneBuilder {
        <VariableValueOneBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct VariableValueOneBuilder {
    r#type: Option<VariableValueOneType>,
    value: Option<bool>,
}

impl VariableValueOneBuilder {
    pub fn r#type(mut self, value: VariableValueOneType) -> Self {
        self.r#type = Some(value);
        self
    }

    pub fn value(mut self, value: bool) -> Self {
        self.value = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`VariableValueOne`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](VariableValueOneBuilder::r#type)
    pub fn build(self) -> Result<VariableValueOne, BuildError> {
        Ok(VariableValueOne {
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
            value: self.value,
        })
    }
}
