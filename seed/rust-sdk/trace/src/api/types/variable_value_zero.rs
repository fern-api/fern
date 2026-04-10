pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct VariableValueZero {
    pub r#type: VariableValueZeroType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<i64>,
}

impl VariableValueZero {
    pub fn builder() -> VariableValueZeroBuilder {
        <VariableValueZeroBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct VariableValueZeroBuilder {
    r#type: Option<VariableValueZeroType>,
    value: Option<i64>,
}

impl VariableValueZeroBuilder {
    pub fn r#type(mut self, value: VariableValueZeroType) -> Self {
        self.r#type = Some(value);
        self
    }

    pub fn value(mut self, value: i64) -> Self {
        self.value = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`VariableValueZero`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](VariableValueZeroBuilder::r#type)
    pub fn build(self) -> Result<VariableValueZero, BuildError> {
        Ok(VariableValueZero {
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
            value: self.value,
        })
    }
}
