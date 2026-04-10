pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct VariableValueSeven {
    #[serde(flatten)]
    pub binary_tree_value_fields: BinaryTreeValue,
    pub r#type: VariableValueSevenType,
}

impl VariableValueSeven {
    pub fn builder() -> VariableValueSevenBuilder {
        <VariableValueSevenBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct VariableValueSevenBuilder {
    binary_tree_value_fields: Option<BinaryTreeValue>,
    r#type: Option<VariableValueSevenType>,
}

impl VariableValueSevenBuilder {
    pub fn binary_tree_value_fields(mut self, value: BinaryTreeValue) -> Self {
        self.binary_tree_value_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: VariableValueSevenType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`VariableValueSeven`].
    /// This method will fail if any of the following fields are not set:
    /// - [`binary_tree_value_fields`](VariableValueSevenBuilder::binary_tree_value_fields)
    /// - [`r#type`](VariableValueSevenBuilder::r#type)
    pub fn build(self) -> Result<VariableValueSeven, BuildError> {
        Ok(VariableValueSeven {
            binary_tree_value_fields: self
                .binary_tree_value_fields
                .ok_or_else(|| BuildError::missing_field("binary_tree_value_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
