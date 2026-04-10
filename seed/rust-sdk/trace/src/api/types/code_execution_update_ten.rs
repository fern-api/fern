pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct CodeExecutionUpdateTen {
    #[serde(flatten)]
    pub finished_response_fields: FinishedResponse,
    pub r#type: CodeExecutionUpdateTenType,
}

impl CodeExecutionUpdateTen {
    pub fn builder() -> CodeExecutionUpdateTenBuilder {
        <CodeExecutionUpdateTenBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CodeExecutionUpdateTenBuilder {
    finished_response_fields: Option<FinishedResponse>,
    r#type: Option<CodeExecutionUpdateTenType>,
}

impl CodeExecutionUpdateTenBuilder {
    pub fn finished_response_fields(mut self, value: FinishedResponse) -> Self {
        self.finished_response_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: CodeExecutionUpdateTenType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`CodeExecutionUpdateTen`].
    /// This method will fail if any of the following fields are not set:
    /// - [`finished_response_fields`](CodeExecutionUpdateTenBuilder::finished_response_fields)
    /// - [`r#type`](CodeExecutionUpdateTenBuilder::r#type)
    pub fn build(self) -> Result<CodeExecutionUpdateTen, BuildError> {
        Ok(CodeExecutionUpdateTen {
            finished_response_fields: self
                .finished_response_fields
                .ok_or_else(|| BuildError::missing_field("finished_response_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
