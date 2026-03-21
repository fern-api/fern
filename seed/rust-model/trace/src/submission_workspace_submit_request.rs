pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct WorkspaceSubmitRequest {
    #[serde(rename = "submissionId")]
    #[serde(default)]
    pub submission_id: SubmissionId,
    pub language: Language,
    #[serde(rename = "submissionFiles")]
    #[serde(default)]
    pub submission_files: Vec<SubmissionFileInfo>,
    #[serde(rename = "userId")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub user_id: Option<String>,
}

impl WorkspaceSubmitRequest {
    pub fn builder() -> WorkspaceSubmitRequestBuilder {
        WorkspaceSubmitRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct WorkspaceSubmitRequestBuilder {
    submission_id: Option<SubmissionId>,
    language: Option<Language>,
    submission_files: Option<Vec<SubmissionFileInfo>>,
    user_id: Option<String>,
}

impl WorkspaceSubmitRequestBuilder {
    pub fn submission_id(mut self, value: SubmissionId) -> Self {
        self.submission_id = Some(value);
        self
    }

    pub fn language(mut self, value: Language) -> Self {
        self.language = Some(value);
        self
    }

    pub fn submission_files(mut self, value: Vec<SubmissionFileInfo>) -> Self {
        self.submission_files = Some(value);
        self
    }

    pub fn user_id(mut self, value: impl Into<String>) -> Self {
        self.user_id = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`WorkspaceSubmitRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`submission_id`](WorkspaceSubmitRequestBuilder::submission_id)
    /// - [`language`](WorkspaceSubmitRequestBuilder::language)
    /// - [`submission_files`](WorkspaceSubmitRequestBuilder::submission_files)
    pub fn build(self) -> Result<WorkspaceSubmitRequest, BuildError> {
        Ok(WorkspaceSubmitRequest {
            submission_id: self.submission_id.ok_or_else(|| BuildError::missing_field("submission_id"))?,
            language: self.language.ok_or_else(|| BuildError::missing_field("language"))?,
            submission_files: self.submission_files.ok_or_else(|| BuildError::missing_field("submission_files"))?,
            user_id: self.user_id,
        })
    }
}
