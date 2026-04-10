pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct CodeExecutionUpdateEight {
    #[serde(flatten)]
    pub recorded_response_notification_fields: RecordedResponseNotification,
    pub r#type: CodeExecutionUpdateEightType,
}

impl CodeExecutionUpdateEight {
    pub fn builder() -> CodeExecutionUpdateEightBuilder {
        <CodeExecutionUpdateEightBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CodeExecutionUpdateEightBuilder {
    recorded_response_notification_fields: Option<RecordedResponseNotification>,
    r#type: Option<CodeExecutionUpdateEightType>,
}

impl CodeExecutionUpdateEightBuilder {
    pub fn recorded_response_notification_fields(
        mut self,
        value: RecordedResponseNotification,
    ) -> Self {
        self.recorded_response_notification_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: CodeExecutionUpdateEightType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`CodeExecutionUpdateEight`].
    /// This method will fail if any of the following fields are not set:
    /// - [`recorded_response_notification_fields`](CodeExecutionUpdateEightBuilder::recorded_response_notification_fields)
    /// - [`r#type`](CodeExecutionUpdateEightBuilder::r#type)
    pub fn build(self) -> Result<CodeExecutionUpdateEight, BuildError> {
        Ok(CodeExecutionUpdateEight {
            recorded_response_notification_fields: self
                .recorded_response_notification_fields
                .ok_or_else(|| {
                    BuildError::missing_field("recorded_response_notification_fields")
                })?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
