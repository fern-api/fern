pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct CodeExecutionUpdateOne {
    #[serde(flatten)]
    pub running_response_fields: RunningResponse,
    pub r#type: CodeExecutionUpdateOneType,
}

impl CodeExecutionUpdateOne {
    pub fn builder() -> CodeExecutionUpdateOneBuilder {
        <CodeExecutionUpdateOneBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CodeExecutionUpdateOneBuilder {
    running_response_fields: Option<RunningResponse>,
    r#type: Option<CodeExecutionUpdateOneType>,
}

impl CodeExecutionUpdateOneBuilder {
    pub fn running_response_fields(mut self, value: RunningResponse) -> Self {
        self.running_response_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: CodeExecutionUpdateOneType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`CodeExecutionUpdateOne`].
    /// This method will fail if any of the following fields are not set:
    /// - [`running_response_fields`](CodeExecutionUpdateOneBuilder::running_response_fields)
    /// - [`r#type`](CodeExecutionUpdateOneBuilder::r#type)
    pub fn build(self) -> Result<CodeExecutionUpdateOne, BuildError> {
        Ok(CodeExecutionUpdateOne {
            running_response_fields: self
                .running_response_fields
                .ok_or_else(|| BuildError::missing_field("running_response_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
