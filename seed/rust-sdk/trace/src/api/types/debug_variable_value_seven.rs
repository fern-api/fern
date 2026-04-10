pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct DebugVariableValueSeven {
    #[serde(flatten)]
    pub binary_tree_node_and_tree_value_fields: BinaryTreeNodeAndTreeValue,
    pub r#type: DebugVariableValueSevenType,
}

impl DebugVariableValueSeven {
    pub fn builder() -> DebugVariableValueSevenBuilder {
        <DebugVariableValueSevenBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DebugVariableValueSevenBuilder {
    binary_tree_node_and_tree_value_fields: Option<BinaryTreeNodeAndTreeValue>,
    r#type: Option<DebugVariableValueSevenType>,
}

impl DebugVariableValueSevenBuilder {
    pub fn binary_tree_node_and_tree_value_fields(
        mut self,
        value: BinaryTreeNodeAndTreeValue,
    ) -> Self {
        self.binary_tree_node_and_tree_value_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: DebugVariableValueSevenType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`DebugVariableValueSeven`].
    /// This method will fail if any of the following fields are not set:
    /// - [`binary_tree_node_and_tree_value_fields`](DebugVariableValueSevenBuilder::binary_tree_node_and_tree_value_fields)
    /// - [`r#type`](DebugVariableValueSevenBuilder::r#type)
    pub fn build(self) -> Result<DebugVariableValueSeven, BuildError> {
        Ok(DebugVariableValueSeven {
            binary_tree_node_and_tree_value_fields: self
                .binary_tree_node_and_tree_value_fields
                .ok_or_else(|| {
                    BuildError::missing_field("binary_tree_node_and_tree_value_fields")
                })?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
