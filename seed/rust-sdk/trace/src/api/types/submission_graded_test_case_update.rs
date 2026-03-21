pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GradedTestCaseUpdate {
    #[serde(rename = "testCaseId")]
    #[serde(default)]
    pub test_case_id: TestCaseId,
    pub grade: TestCaseGrade,
}

impl GradedTestCaseUpdate {
    pub fn builder() -> GradedTestCaseUpdateBuilder {
        GradedTestCaseUpdateBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GradedTestCaseUpdateBuilder {
    test_case_id: Option<TestCaseId>,
    grade: Option<TestCaseGrade>,
}

impl GradedTestCaseUpdateBuilder {
    pub fn test_case_id(mut self, value: TestCaseId) -> Self {
        self.test_case_id = Some(value);
        self
    }

    pub fn grade(mut self, value: TestCaseGrade) -> Self {
        self.grade = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`GradedTestCaseUpdate`].
    /// This method will fail if any of the following fields are not set:
    /// - [`test_case_id`](GradedTestCaseUpdateBuilder::test_case_id)
    /// - [`grade`](GradedTestCaseUpdateBuilder::grade)
    pub fn build(self) -> Result<GradedTestCaseUpdate, BuildError> {
        Ok(GradedTestCaseUpdate {
            test_case_id: self
                .test_case_id
                .ok_or_else(|| BuildError::missing_field("test_case_id"))?,
            grade: self
                .grade
                .ok_or_else(|| BuildError::missing_field("grade"))?,
        })
    }
}
