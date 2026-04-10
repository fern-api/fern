pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct CodeExecutionUpdateSeven {
    #[serde(flatten)]
    pub recording_response_notification_fields: RecordingResponseNotification,
    pub r#type: CodeExecutionUpdateSevenType,
}

impl CodeExecutionUpdateSeven {
    pub fn builder() -> CodeExecutionUpdateSevenBuilder {
        <CodeExecutionUpdateSevenBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CodeExecutionUpdateSevenBuilder {
    recording_response_notification_fields: Option<RecordingResponseNotification>,
    r#type: Option<CodeExecutionUpdateSevenType>,
}

impl CodeExecutionUpdateSevenBuilder {
    pub fn recording_response_notification_fields(mut self, value: RecordingResponseNotification) -> Self {
        self.recording_response_notification_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: CodeExecutionUpdateSevenType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`CodeExecutionUpdateSeven`].
    /// This method will fail if any of the following fields are not set:
    /// - [`recording_response_notification_fields`](CodeExecutionUpdateSevenBuilder::recording_response_notification_fields)
    /// - [`r#type`](CodeExecutionUpdateSevenBuilder::r#type)
    pub fn build(self) -> Result<CodeExecutionUpdateSeven, BuildError> {
        Ok(CodeExecutionUpdateSeven {
            recording_response_notification_fields: self.recording_response_notification_fields.ok_or_else(|| BuildError::missing_field("recording_response_notification_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
