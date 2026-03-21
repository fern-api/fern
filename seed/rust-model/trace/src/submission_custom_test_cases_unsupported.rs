pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct CustomTestCasesUnsupported {
    #[serde(rename = "problemId")]
    #[serde(default)]
    pub problem_id: ProblemId,
    #[serde(rename = "submissionId")]
    #[serde(default)]
    pub submission_id: SubmissionId,
}

impl CustomTestCasesUnsupported {
    pub fn builder() -> CustomTestCasesUnsupportedBuilder {
        CustomTestCasesUnsupportedBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CustomTestCasesUnsupportedBuilder {
    problem_id: Option<ProblemId>,
    submission_id: Option<SubmissionId>,
}

impl CustomTestCasesUnsupportedBuilder {
    pub fn problem_id(mut self, value: ProblemId) -> Self {
        self.problem_id = Some(value);
        self
    }

    pub fn submission_id(mut self, value: SubmissionId) -> Self {
        self.submission_id = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`CustomTestCasesUnsupported`].
    /// This method will fail if any of the following fields are not set:
    /// - [`problem_id`](CustomTestCasesUnsupportedBuilder::problem_id)
    /// - [`submission_id`](CustomTestCasesUnsupportedBuilder::submission_id)
    pub fn build(self) -> Result<CustomTestCasesUnsupported, BuildError> {
        Ok(CustomTestCasesUnsupported {
            problem_id: self.problem_id.ok_or_else(|| BuildError::missing_field("problem_id"))?,
            submission_id: self.submission_id.ok_or_else(|| BuildError::missing_field("submission_id"))?,
        })
    }
}
