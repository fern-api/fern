pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ActualResultZero {
    pub r#type: ActualResultZeroType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<VariableValue>,
}

impl ActualResultZero {
    pub fn builder() -> ActualResultZeroBuilder {
        <ActualResultZeroBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ActualResultZeroBuilder {
    r#type: Option<ActualResultZeroType>,
    value: Option<VariableValue>,
}

impl ActualResultZeroBuilder {
    pub fn r#type(mut self, value: ActualResultZeroType) -> Self {
        self.r#type = Some(value);
        self
    }

    pub fn value(mut self, value: VariableValue) -> Self {
        self.value = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ActualResultZero`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](ActualResultZeroBuilder::r#type)
    pub fn build(self) -> Result<ActualResultZero, BuildError> {
        Ok(ActualResultZero {
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
            value: self.value,
        })
    }
}
