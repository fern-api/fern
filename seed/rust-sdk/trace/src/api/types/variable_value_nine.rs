pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct VariableValueNine {
    #[serde(flatten)]
    pub doubly_linked_list_value_fields: DoublyLinkedListValue,
    pub r#type: VariableValueNineType,
}

impl VariableValueNine {
    pub fn builder() -> VariableValueNineBuilder {
        <VariableValueNineBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct VariableValueNineBuilder {
    doubly_linked_list_value_fields: Option<DoublyLinkedListValue>,
    r#type: Option<VariableValueNineType>,
}

impl VariableValueNineBuilder {
    pub fn doubly_linked_list_value_fields(mut self, value: DoublyLinkedListValue) -> Self {
        self.doubly_linked_list_value_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: VariableValueNineType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`VariableValueNine`].
    /// This method will fail if any of the following fields are not set:
    /// - [`doubly_linked_list_value_fields`](VariableValueNineBuilder::doubly_linked_list_value_fields)
    /// - [`r#type`](VariableValueNineBuilder::r#type)
    pub fn build(self) -> Result<VariableValueNine, BuildError> {
        Ok(VariableValueNine {
            doubly_linked_list_value_fields: self
                .doubly_linked_list_value_fields
                .ok_or_else(|| BuildError::missing_field("doubly_linked_list_value_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
