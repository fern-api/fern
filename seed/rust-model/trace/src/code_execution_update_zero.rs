pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct CodeExecutionUpdateZero {
    #[serde(flatten)]
    pub building_executor_response_fields: BuildingExecutorResponse,
    pub r#type: CodeExecutionUpdateZeroType,
}

impl CodeExecutionUpdateZero {
    pub fn builder() -> CodeExecutionUpdateZeroBuilder {
        <CodeExecutionUpdateZeroBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CodeExecutionUpdateZeroBuilder {
    building_executor_response_fields: Option<BuildingExecutorResponse>,
    r#type: Option<CodeExecutionUpdateZeroType>,
}

impl CodeExecutionUpdateZeroBuilder {
    pub fn building_executor_response_fields(mut self, value: BuildingExecutorResponse) -> Self {
        self.building_executor_response_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: CodeExecutionUpdateZeroType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`CodeExecutionUpdateZero`].
    /// This method will fail if any of the following fields are not set:
    /// - [`building_executor_response_fields`](CodeExecutionUpdateZeroBuilder::building_executor_response_fields)
    /// - [`r#type`](CodeExecutionUpdateZeroBuilder::r#type)
    pub fn build(self) -> Result<CodeExecutionUpdateZero, BuildError> {
        Ok(CodeExecutionUpdateZero {
            building_executor_response_fields: self.building_executor_response_fields.ok_or_else(|| BuildError::missing_field("building_executor_response_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
