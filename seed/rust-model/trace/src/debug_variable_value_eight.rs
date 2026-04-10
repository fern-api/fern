pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct DebugVariableValueEight {
    #[serde(flatten)]
    pub singly_linked_list_node_and_list_value_fields: SinglyLinkedListNodeAndListValue,
    pub r#type: DebugVariableValueEightType,
}

impl DebugVariableValueEight {
    pub fn builder() -> DebugVariableValueEightBuilder {
        <DebugVariableValueEightBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DebugVariableValueEightBuilder {
    singly_linked_list_node_and_list_value_fields: Option<SinglyLinkedListNodeAndListValue>,
    r#type: Option<DebugVariableValueEightType>,
}

impl DebugVariableValueEightBuilder {
    pub fn singly_linked_list_node_and_list_value_fields(mut self, value: SinglyLinkedListNodeAndListValue) -> Self {
        self.singly_linked_list_node_and_list_value_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: DebugVariableValueEightType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`DebugVariableValueEight`].
    /// This method will fail if any of the following fields are not set:
    /// - [`singly_linked_list_node_and_list_value_fields`](DebugVariableValueEightBuilder::singly_linked_list_node_and_list_value_fields)
    /// - [`r#type`](DebugVariableValueEightBuilder::r#type)
    pub fn build(self) -> Result<DebugVariableValueEight, BuildError> {
        Ok(DebugVariableValueEight {
            singly_linked_list_node_and_list_value_fields: self.singly_linked_list_node_and_list_value_fields.ok_or_else(|| BuildError::missing_field("singly_linked_list_node_and_list_value_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
