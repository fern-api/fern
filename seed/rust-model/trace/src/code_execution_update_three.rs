pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct CodeExecutionUpdateThree {
    #[serde(flatten)]
    pub stopped_response_fields: StoppedResponse,
    pub r#type: CodeExecutionUpdateThreeType,
}

impl CodeExecutionUpdateThree {
    pub fn builder() -> CodeExecutionUpdateThreeBuilder {
        <CodeExecutionUpdateThreeBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CodeExecutionUpdateThreeBuilder {
    stopped_response_fields: Option<StoppedResponse>,
    r#type: Option<CodeExecutionUpdateThreeType>,
}

impl CodeExecutionUpdateThreeBuilder {
    pub fn stopped_response_fields(mut self, value: StoppedResponse) -> Self {
        self.stopped_response_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: CodeExecutionUpdateThreeType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`CodeExecutionUpdateThree`].
    /// This method will fail if any of the following fields are not set:
    /// - [`stopped_response_fields`](CodeExecutionUpdateThreeBuilder::stopped_response_fields)
    /// - [`r#type`](CodeExecutionUpdateThreeBuilder::r#type)
    pub fn build(self) -> Result<CodeExecutionUpdateThree, BuildError> {
        Ok(CodeExecutionUpdateThree {
            stopped_response_fields: self.stopped_response_fields.ok_or_else(|| BuildError::missing_field("stopped_response_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
