pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct TestCaseNonHiddenGrade {
    #[serde(default)]
    pub passed: bool,
    #[serde(rename = "actualResult")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub actual_result: Option<VariableValue>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub exception: Option<ExceptionV2>,
    #[serde(default)]
    pub stdout: String,
}

impl TestCaseNonHiddenGrade {
    pub fn builder() -> TestCaseNonHiddenGradeBuilder {
        TestCaseNonHiddenGradeBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TestCaseNonHiddenGradeBuilder {
    passed: Option<bool>,
    actual_result: Option<VariableValue>,
    exception: Option<ExceptionV2>,
    stdout: Option<String>,
}

impl TestCaseNonHiddenGradeBuilder {
    pub fn passed(mut self, value: bool) -> Self {
        self.passed = Some(value);
        self
    }

    pub fn actual_result(mut self, value: VariableValue) -> Self {
        self.actual_result = Some(value);
        self
    }

    pub fn exception(mut self, value: ExceptionV2) -> Self {
        self.exception = Some(value);
        self
    }

    pub fn stdout(mut self, value: impl Into<String>) -> Self {
        self.stdout = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`TestCaseNonHiddenGrade`].
    /// This method will fail if any of the following fields are not set:
    /// - [`passed`](TestCaseNonHiddenGradeBuilder::passed)
    /// - [`stdout`](TestCaseNonHiddenGradeBuilder::stdout)
    pub fn build(self) -> Result<TestCaseNonHiddenGrade, BuildError> {
        Ok(TestCaseNonHiddenGrade {
            passed: self.passed.ok_or_else(|| BuildError::missing_field("passed"))?,
            actual_result: self.actual_result,
            exception: self.exception,
            stdout: self.stdout.ok_or_else(|| BuildError::missing_field("stdout"))?,
        })
    }
}
