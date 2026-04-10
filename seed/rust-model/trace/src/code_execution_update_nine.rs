pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct CodeExecutionUpdateNine {
    #[serde(flatten)]
    pub invalid_request_response_fields: InvalidRequestResponse,
    pub r#type: CodeExecutionUpdateNineType,
}

impl CodeExecutionUpdateNine {
    pub fn builder() -> CodeExecutionUpdateNineBuilder {
        <CodeExecutionUpdateNineBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CodeExecutionUpdateNineBuilder {
    invalid_request_response_fields: Option<InvalidRequestResponse>,
    r#type: Option<CodeExecutionUpdateNineType>,
}

impl CodeExecutionUpdateNineBuilder {
    pub fn invalid_request_response_fields(mut self, value: InvalidRequestResponse) -> Self {
        self.invalid_request_response_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: CodeExecutionUpdateNineType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`CodeExecutionUpdateNine`].
    /// This method will fail if any of the following fields are not set:
    /// - [`invalid_request_response_fields`](CodeExecutionUpdateNineBuilder::invalid_request_response_fields)
    /// - [`r#type`](CodeExecutionUpdateNineBuilder::r#type)
    pub fn build(self) -> Result<CodeExecutionUpdateNine, BuildError> {
        Ok(CodeExecutionUpdateNine {
            invalid_request_response_fields: self.invalid_request_response_fields.ok_or_else(|| BuildError::missing_field("invalid_request_response_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
