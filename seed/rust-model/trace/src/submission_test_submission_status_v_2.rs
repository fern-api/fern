pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestSubmissionStatusV2 {
    #[serde(default)]
    pub updates: Vec<TestSubmissionUpdate>,
    #[serde(rename = "problemId")]
    #[serde(default)]
    pub problem_id: ProblemId,
    #[serde(rename = "problemVersion")]
    #[serde(default)]
    pub problem_version: i64,
    #[serde(rename = "problemInfo")]
    pub problem_info: ProblemInfoV2,
}

impl TestSubmissionStatusV2 {
    pub fn builder() -> TestSubmissionStatusV2Builder {
        TestSubmissionStatusV2Builder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TestSubmissionStatusV2Builder {
    updates: Option<Vec<TestSubmissionUpdate>>,
    problem_id: Option<ProblemId>,
    problem_version: Option<i64>,
    problem_info: Option<ProblemInfoV2>,
}

impl TestSubmissionStatusV2Builder {
    pub fn updates(mut self, value: Vec<TestSubmissionUpdate>) -> Self {
        self.updates = Some(value);
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

    pub fn problem_info(mut self, value: ProblemInfoV2) -> Self {
        self.problem_info = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TestSubmissionStatusV2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`updates`](TestSubmissionStatusV2Builder::updates)
    /// - [`problem_id`](TestSubmissionStatusV2Builder::problem_id)
    /// - [`problem_version`](TestSubmissionStatusV2Builder::problem_version)
    /// - [`problem_info`](TestSubmissionStatusV2Builder::problem_info)
    pub fn build(self) -> Result<TestSubmissionStatusV2, BuildError> {
        Ok(TestSubmissionStatusV2 {
            updates: self.updates.ok_or_else(|| BuildError::missing_field("updates"))?,
            problem_id: self.problem_id.ok_or_else(|| BuildError::missing_field("problem_id"))?,
            problem_version: self.problem_version.ok_or_else(|| BuildError::missing_field("problem_version"))?,
            problem_info: self.problem_info.ok_or_else(|| BuildError::missing_field("problem_info"))?,
        })
    }
}
