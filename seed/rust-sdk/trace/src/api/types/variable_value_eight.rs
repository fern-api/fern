pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct VariableValueEight {
    #[serde(flatten)]
    pub singly_linked_list_value_fields: SinglyLinkedListValue,
    pub r#type: VariableValueEightType,
}

impl VariableValueEight {
    pub fn builder() -> VariableValueEightBuilder {
        <VariableValueEightBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct VariableValueEightBuilder {
    singly_linked_list_value_fields: Option<SinglyLinkedListValue>,
    r#type: Option<VariableValueEightType>,
}

impl VariableValueEightBuilder {
    pub fn singly_linked_list_value_fields(mut self, value: SinglyLinkedListValue) -> Self {
        self.singly_linked_list_value_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: VariableValueEightType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`VariableValueEight`].
    /// This method will fail if any of the following fields are not set:
    /// - [`singly_linked_list_value_fields`](VariableValueEightBuilder::singly_linked_list_value_fields)
    /// - [`r#type`](VariableValueEightBuilder::r#type)
    pub fn build(self) -> Result<VariableValueEight, BuildError> {
        Ok(VariableValueEight {
            singly_linked_list_value_fields: self
                .singly_linked_list_value_fields
                .ok_or_else(|| BuildError::missing_field("singly_linked_list_value_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
