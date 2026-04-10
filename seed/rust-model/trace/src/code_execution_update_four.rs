pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CodeExecutionUpdateFour {
    #[serde(flatten)]
    pub graded_response_fields: GradedResponse,
    pub r#type: CodeExecutionUpdateFourType,
}

impl CodeExecutionUpdateFour {
    pub fn builder() -> CodeExecutionUpdateFourBuilder {
        <CodeExecutionUpdateFourBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CodeExecutionUpdateFourBuilder {
    graded_response_fields: Option<GradedResponse>,
    r#type: Option<CodeExecutionUpdateFourType>,
}

impl CodeExecutionUpdateFourBuilder {
    pub fn graded_response_fields(mut self, value: GradedResponse) -> Self {
        self.graded_response_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: CodeExecutionUpdateFourType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`CodeExecutionUpdateFour`].
    /// This method will fail if any of the following fields are not set:
    /// - [`graded_response_fields`](CodeExecutionUpdateFourBuilder::graded_response_fields)
    /// - [`r#type`](CodeExecutionUpdateFourBuilder::r#type)
    pub fn build(self) -> Result<CodeExecutionUpdateFour, BuildError> {
        Ok(CodeExecutionUpdateFour {
            graded_response_fields: self.graded_response_fields.ok_or_else(|| BuildError::missing_field("graded_response_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
