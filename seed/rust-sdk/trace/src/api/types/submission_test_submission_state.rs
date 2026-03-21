pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestSubmissionState {
    #[serde(rename = "problemId")]
    #[serde(default)]
    pub problem_id: ProblemId,
    #[serde(rename = "defaultTestCases")]
    #[serde(default)]
    pub default_test_cases: Vec<TestCase>,
    #[serde(rename = "customTestCases")]
    #[serde(default)]
    pub custom_test_cases: Vec<TestCase>,
    pub status: TestSubmissionStatus,
}

impl TestSubmissionState {
    pub fn builder() -> TestSubmissionStateBuilder {
        TestSubmissionStateBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TestSubmissionStateBuilder {
    problem_id: Option<ProblemId>,
    default_test_cases: Option<Vec<TestCase>>,
    custom_test_cases: Option<Vec<TestCase>>,
    status: Option<TestSubmissionStatus>,
}

impl TestSubmissionStateBuilder {
    pub fn problem_id(mut self, value: ProblemId) -> Self {
        self.problem_id = Some(value);
        self
    }

    pub fn default_test_cases(mut self, value: Vec<TestCase>) -> Self {
        self.default_test_cases = Some(value);
        self
    }

    pub fn custom_test_cases(mut self, value: Vec<TestCase>) -> Self {
        self.custom_test_cases = Some(value);
        self
    }

    pub fn status(mut self, value: TestSubmissionStatus) -> Self {
        self.status = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TestSubmissionState`].
    /// This method will fail if any of the following fields are not set:
    /// - [`problem_id`](TestSubmissionStateBuilder::problem_id)
    /// - [`default_test_cases`](TestSubmissionStateBuilder::default_test_cases)
    /// - [`custom_test_cases`](TestSubmissionStateBuilder::custom_test_cases)
    /// - [`status`](TestSubmissionStateBuilder::status)
    pub fn build(self) -> Result<TestSubmissionState, BuildError> {
        Ok(TestSubmissionState {
            problem_id: self
                .problem_id
                .ok_or_else(|| BuildError::missing_field("problem_id"))?,
            default_test_cases: self
                .default_test_cases
                .ok_or_else(|| BuildError::missing_field("default_test_cases"))?,
            custom_test_cases: self
                .custom_test_cases
                .ok_or_else(|| BuildError::missing_field("custom_test_cases"))?,
            status: self
                .status
                .ok_or_else(|| BuildError::missing_field("status"))?,
        })
    }
}
