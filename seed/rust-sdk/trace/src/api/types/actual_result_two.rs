pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ActualResultTwo {
    pub r#type: ActualResultTwoType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<ExceptionV2>,
}

impl ActualResultTwo {
    pub fn builder() -> ActualResultTwoBuilder {
        <ActualResultTwoBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ActualResultTwoBuilder {
    r#type: Option<ActualResultTwoType>,
    value: Option<ExceptionV2>,
}

impl ActualResultTwoBuilder {
    pub fn r#type(mut self, value: ActualResultTwoType) -> Self {
        self.r#type = Some(value);
        self
    }

    pub fn value(mut self, value: ExceptionV2) -> Self {
        self.value = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ActualResultTwo`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](ActualResultTwoBuilder::r#type)
    pub fn build(self) -> Result<ActualResultTwo, BuildError> {
        Ok(ActualResultTwo {
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
            value: self.value,
        })
    }
}
