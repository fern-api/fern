pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct VariableValueThree {
    pub r#type: VariableValueThreeType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<String>,
}

impl VariableValueThree {
    pub fn builder() -> VariableValueThreeBuilder {
        <VariableValueThreeBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct VariableValueThreeBuilder {
    r#type: Option<VariableValueThreeType>,
    value: Option<String>,
}

impl VariableValueThreeBuilder {
    pub fn r#type(mut self, value: VariableValueThreeType) -> Self {
        self.r#type = Some(value);
        self
    }

    pub fn value(mut self, value: impl Into<String>) -> Self {
        self.value = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`VariableValueThree`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](VariableValueThreeBuilder::r#type)
    pub fn build(self) -> Result<VariableValueThree, BuildError> {
        Ok(VariableValueThree {
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
            value: self.value,
        })
    }
}
