pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct GradedResponse {
    #[serde(rename = "submissionId")]
    #[serde(default)]
    pub submission_id: SubmissionId,
    #[serde(rename = "testCases")]
    #[serde(default)]
    pub test_cases: HashMap<String, TestCaseResultWithStdout>,
}

impl GradedResponse {
    pub fn builder() -> GradedResponseBuilder {
        GradedResponseBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GradedResponseBuilder {
    submission_id: Option<SubmissionId>,
    test_cases: Option<HashMap<String, TestCaseResultWithStdout>>,
}

impl GradedResponseBuilder {
    pub fn submission_id(mut self, value: SubmissionId) -> Self {
        self.submission_id = Some(value);
        self
    }

    pub fn test_cases(mut self, value: HashMap<String, TestCaseResultWithStdout>) -> Self {
        self.test_cases = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`GradedResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`submission_id`](GradedResponseBuilder::submission_id)
    /// - [`test_cases`](GradedResponseBuilder::test_cases)
    pub fn build(self) -> Result<GradedResponse, BuildError> {
        Ok(GradedResponse {
            submission_id: self
                .submission_id
                .ok_or_else(|| BuildError::missing_field("submission_id"))?,
            test_cases: self
                .test_cases
                .ok_or_else(|| BuildError::missing_field("test_cases"))?,
        })
    }
}
