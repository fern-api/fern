pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct TestCaseHiddenGrade {
    #[serde(default)]
    pub passed: bool,
}

impl TestCaseHiddenGrade {
    pub fn builder() -> TestCaseHiddenGradeBuilder {
        TestCaseHiddenGradeBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TestCaseHiddenGradeBuilder {
    passed: Option<bool>,
}

impl TestCaseHiddenGradeBuilder {
    pub fn passed(mut self, value: bool) -> Self {
        self.passed = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TestCaseHiddenGrade`].
    /// This method will fail if any of the following fields are not set:
    /// - [`passed`](TestCaseHiddenGradeBuilder::passed)
    pub fn build(self) -> Result<TestCaseHiddenGrade, BuildError> {
        Ok(TestCaseHiddenGrade {
            passed: self.passed.ok_or_else(|| BuildError::missing_field("passed"))?,
        })
    }
}
