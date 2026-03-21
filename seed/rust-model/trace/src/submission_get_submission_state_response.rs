pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GetSubmissionStateResponse {
    #[serde(rename = "timeSubmitted")]
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::flexible_datetime::offset::option")]
    pub time_submitted: Option<DateTime<FixedOffset>>,
    #[serde(default)]
    pub submission: String,
    pub language: Language,
    #[serde(rename = "submissionTypeState")]
    pub submission_type_state: SubmissionTypeState,
}

impl GetSubmissionStateResponse {
    pub fn builder() -> GetSubmissionStateResponseBuilder {
        GetSubmissionStateResponseBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GetSubmissionStateResponseBuilder {
    time_submitted: Option<DateTime<FixedOffset>>,
    submission: Option<String>,
    language: Option<Language>,
    submission_type_state: Option<SubmissionTypeState>,
}

impl GetSubmissionStateResponseBuilder {
    pub fn time_submitted(mut self, value: DateTime<FixedOffset>) -> Self {
        self.time_submitted = Some(value);
        self
    }

    pub fn submission(mut self, value: impl Into<String>) -> Self {
        self.submission = Some(value.into());
        self
    }

    pub fn language(mut self, value: Language) -> Self {
        self.language = Some(value);
        self
    }

    pub fn submission_type_state(mut self, value: SubmissionTypeState) -> Self {
        self.submission_type_state = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`GetSubmissionStateResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`submission`](GetSubmissionStateResponseBuilder::submission)
    /// - [`language`](GetSubmissionStateResponseBuilder::language)
    /// - [`submission_type_state`](GetSubmissionStateResponseBuilder::submission_type_state)
    pub fn build(self) -> Result<GetSubmissionStateResponse, BuildError> {
        Ok(GetSubmissionStateResponse {
            time_submitted: self.time_submitted,
            submission: self.submission.ok_or_else(|| BuildError::missing_field("submission"))?,
            language: self.language.ok_or_else(|| BuildError::missing_field("language"))?,
            submission_type_state: self.submission_type_state.ok_or_else(|| BuildError::missing_field("submission_type_state"))?,
        })
    }
}
