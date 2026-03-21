pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SubmitRequestV2 {
    #[serde(rename = "submissionId")]
    #[serde(default)]
    pub submission_id: SubmissionId,
    pub language: Language,
    #[serde(rename = "submissionFiles")]
    #[serde(default)]
    pub submission_files: Vec<SubmissionFileInfo>,
    #[serde(rename = "problemId")]
    #[serde(default)]
    pub problem_id: ProblemId,
    #[serde(rename = "problemVersion")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub problem_version: Option<i64>,
    #[serde(rename = "userId")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub user_id: Option<String>,
}

impl SubmitRequestV2 {
    pub fn builder() -> SubmitRequestV2Builder {
        SubmitRequestV2Builder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SubmitRequestV2Builder {
    submission_id: Option<SubmissionId>,
    language: Option<Language>,
    submission_files: Option<Vec<SubmissionFileInfo>>,
    problem_id: Option<ProblemId>,
    problem_version: Option<i64>,
    user_id: Option<String>,
}

impl SubmitRequestV2Builder {
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

    pub fn problem_id(mut self, value: ProblemId) -> Self {
        self.problem_id = Some(value);
        self
    }

    pub fn problem_version(mut self, value: i64) -> Self {
        self.problem_version = Some(value);
        self
    }

    pub fn user_id(mut self, value: impl Into<String>) -> Self {
        self.user_id = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`SubmitRequestV2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`submission_id`](SubmitRequestV2Builder::submission_id)
    /// - [`language`](SubmitRequestV2Builder::language)
    /// - [`submission_files`](SubmitRequestV2Builder::submission_files)
    /// - [`problem_id`](SubmitRequestV2Builder::problem_id)
    pub fn build(self) -> Result<SubmitRequestV2, BuildError> {
        Ok(SubmitRequestV2 {
            submission_id: self.submission_id.ok_or_else(|| BuildError::missing_field("submission_id"))?,
            language: self.language.ok_or_else(|| BuildError::missing_field("language"))?,
            submission_files: self.submission_files.ok_or_else(|| BuildError::missing_field("submission_files"))?,
            problem_id: self.problem_id.ok_or_else(|| BuildError::missing_field("problem_id"))?,
            problem_version: self.problem_version,
            user_id: self.user_id,
        })
    }
}
