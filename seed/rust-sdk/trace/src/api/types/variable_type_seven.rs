pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct VariableTypeSeven {
    pub r#type: VariableTypeSevenType,
}

impl VariableTypeSeven {
    pub fn builder() -> VariableTypeSevenBuilder {
        <VariableTypeSevenBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct VariableTypeSevenBuilder {
    r#type: Option<VariableTypeSevenType>,
}

impl VariableTypeSevenBuilder {
    pub fn r#type(mut self, value: VariableTypeSevenType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`VariableTypeSeven`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](VariableTypeSevenBuilder::r#type)
    pub fn build(self) -> Result<VariableTypeSeven, BuildError> {
        Ok(VariableTypeSeven {
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
