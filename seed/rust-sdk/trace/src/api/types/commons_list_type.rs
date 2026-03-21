pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ListType {
    #[serde(rename = "valueType")]
    pub value_type: Box<VariableType>,
    /// Whether this list is fixed-size (for languages that supports fixed-size lists). Defaults to false.
    #[serde(rename = "isFixedLength")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_fixed_length: Option<bool>,
}

impl ListType {
    pub fn builder() -> ListTypeBuilder {
        ListTypeBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListTypeBuilder {
    value_type: Option<Box<VariableType>>,
    is_fixed_length: Option<bool>,
}

impl ListTypeBuilder {
    pub fn value_type(mut self, value: Box<VariableType>) -> Self {
        self.value_type = Some(value);
        self
    }

    pub fn is_fixed_length(mut self, value: bool) -> Self {
        self.is_fixed_length = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ListType`].
    /// This method will fail if any of the following fields are not set:
    /// - [`value_type`](ListTypeBuilder::value_type)
    pub fn build(self) -> Result<ListType, BuildError> {
        Ok(ListType {
            value_type: self
                .value_type
                .ok_or_else(|| BuildError::missing_field("value_type"))?,
            is_fixed_length: self.is_fixed_length,
        })
    }
}
