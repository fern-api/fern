pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct DebugVariableValueNine {
    #[serde(flatten)]
    pub doubly_linked_list_node_and_list_value_fields: DoublyLinkedListNodeAndListValue,
    pub r#type: DebugVariableValueNineType,
}

impl DebugVariableValueNine {
    pub fn builder() -> DebugVariableValueNineBuilder {
        <DebugVariableValueNineBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DebugVariableValueNineBuilder {
    doubly_linked_list_node_and_list_value_fields: Option<DoublyLinkedListNodeAndListValue>,
    r#type: Option<DebugVariableValueNineType>,
}

impl DebugVariableValueNineBuilder {
    pub fn doubly_linked_list_node_and_list_value_fields(mut self, value: DoublyLinkedListNodeAndListValue) -> Self {
        self.doubly_linked_list_node_and_list_value_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: DebugVariableValueNineType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`DebugVariableValueNine`].
    /// This method will fail if any of the following fields are not set:
    /// - [`doubly_linked_list_node_and_list_value_fields`](DebugVariableValueNineBuilder::doubly_linked_list_node_and_list_value_fields)
    /// - [`r#type`](DebugVariableValueNineBuilder::r#type)
    pub fn build(self) -> Result<DebugVariableValueNine, BuildError> {
        Ok(DebugVariableValueNine {
            doubly_linked_list_node_and_list_value_fields: self.doubly_linked_list_node_and_list_value_fields.ok_or_else(|| BuildError::missing_field("doubly_linked_list_node_and_list_value_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
