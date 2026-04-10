pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CodeExecutionUpdateFive {
    #[serde(flatten)]
    pub graded_response_v2_fields: GradedResponseV2,
    pub r#type: CodeExecutionUpdateFiveType,
}

impl CodeExecutionUpdateFive {
    pub fn builder() -> CodeExecutionUpdateFiveBuilder {
        <CodeExecutionUpdateFiveBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CodeExecutionUpdateFiveBuilder {
    graded_response_v2_fields: Option<GradedResponseV2>,
    r#type: Option<CodeExecutionUpdateFiveType>,
}

impl CodeExecutionUpdateFiveBuilder {
    pub fn graded_response_v2_fields(mut self, value: GradedResponseV2) -> Self {
        self.graded_response_v2_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: CodeExecutionUpdateFiveType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`CodeExecutionUpdateFive`].
    /// This method will fail if any of the following fields are not set:
    /// - [`graded_response_v2_fields`](CodeExecutionUpdateFiveBuilder::graded_response_v2_fields)
    /// - [`r#type`](CodeExecutionUpdateFiveBuilder::r#type)
    pub fn build(self) -> Result<CodeExecutionUpdateFive, BuildError> {
        Ok(CodeExecutionUpdateFive {
            graded_response_v2_fields: self.graded_response_v2_fields.ok_or_else(|| BuildError::missing_field("graded_response_v2_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
