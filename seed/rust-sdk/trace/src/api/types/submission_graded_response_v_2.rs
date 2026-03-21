pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct GradedResponseV2 {
    #[serde(rename = "submissionId")]
    #[serde(default)]
    pub submission_id: SubmissionId,
    #[serde(rename = "testCases")]
    #[serde(default)]
    pub test_cases: HashMap<TestCaseId, TestCaseGrade>,
}

impl GradedResponseV2 {
    pub fn builder() -> GradedResponseV2Builder {
        GradedResponseV2Builder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GradedResponseV2Builder {
    submission_id: Option<SubmissionId>,
    test_cases: Option<HashMap<TestCaseId, TestCaseGrade>>,
}

impl GradedResponseV2Builder {
    pub fn submission_id(mut self, value: SubmissionId) -> Self {
        self.submission_id = Some(value);
        self
    }

    pub fn test_cases(mut self, value: HashMap<TestCaseId, TestCaseGrade>) -> Self {
        self.test_cases = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`GradedResponseV2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`submission_id`](GradedResponseV2Builder::submission_id)
    /// - [`test_cases`](GradedResponseV2Builder::test_cases)
    pub fn build(self) -> Result<GradedResponseV2, BuildError> {
        Ok(GradedResponseV2 {
            submission_id: self
                .submission_id
                .ok_or_else(|| BuildError::missing_field("submission_id"))?,
            test_cases: self
                .test_cases
                .ok_or_else(|| BuildError::missing_field("test_cases"))?,
        })
    }
}
