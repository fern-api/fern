pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct VariableTypeFive {
    #[serde(flatten)]
    pub list_type_fields: ListType,
    pub r#type: VariableTypeFiveType,
}

impl VariableTypeFive {
    pub fn builder() -> VariableTypeFiveBuilder {
        <VariableTypeFiveBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct VariableTypeFiveBuilder {
    list_type_fields: Option<ListType>,
    r#type: Option<VariableTypeFiveType>,
}

impl VariableTypeFiveBuilder {
    pub fn list_type_fields(mut self, value: ListType) -> Self {
        self.list_type_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: VariableTypeFiveType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`VariableTypeFive`].
    /// This method will fail if any of the following fields are not set:
    /// - [`list_type_fields`](VariableTypeFiveBuilder::list_type_fields)
    /// - [`r#type`](VariableTypeFiveBuilder::r#type)
    pub fn build(self) -> Result<VariableTypeFive, BuildError> {
        Ok(VariableTypeFive {
            list_type_fields: self
                .list_type_fields
                .ok_or_else(|| BuildError::missing_field("list_type_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
