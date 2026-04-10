pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct CodeExecutionUpdateTwo {
    #[serde(flatten)]
    pub errored_response_fields: ErroredResponse,
    pub r#type: CodeExecutionUpdateTwoType,
}

impl CodeExecutionUpdateTwo {
    pub fn builder() -> CodeExecutionUpdateTwoBuilder {
        <CodeExecutionUpdateTwoBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CodeExecutionUpdateTwoBuilder {
    errored_response_fields: Option<ErroredResponse>,
    r#type: Option<CodeExecutionUpdateTwoType>,
}

impl CodeExecutionUpdateTwoBuilder {
    pub fn errored_response_fields(mut self, value: ErroredResponse) -> Self {
        self.errored_response_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: CodeExecutionUpdateTwoType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`CodeExecutionUpdateTwo`].
    /// This method will fail if any of the following fields are not set:
    /// - [`errored_response_fields`](CodeExecutionUpdateTwoBuilder::errored_response_fields)
    /// - [`r#type`](CodeExecutionUpdateTwoBuilder::r#type)
    pub fn build(self) -> Result<CodeExecutionUpdateTwo, BuildError> {
        Ok(CodeExecutionUpdateTwo {
            errored_response_fields: self.errored_response_fields.ok_or_else(|| BuildError::missing_field("errored_response_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
