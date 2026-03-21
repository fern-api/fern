pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestCaseResult {
    #[serde(rename = "expectedResult")]
    pub expected_result: VariableValue,
    #[serde(rename = "actualResult")]
    pub actual_result: ActualResult,
    #[serde(default)]
    pub passed: bool,
}

impl TestCaseResult {
    pub fn builder() -> TestCaseResultBuilder {
        TestCaseResultBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TestCaseResultBuilder {
    expected_result: Option<VariableValue>,
    actual_result: Option<ActualResult>,
    passed: Option<bool>,
}

impl TestCaseResultBuilder {
    pub fn expected_result(mut self, value: VariableValue) -> Self {
        self.expected_result = Some(value);
        self
    }

    pub fn actual_result(mut self, value: ActualResult) -> Self {
        self.actual_result = Some(value);
        self
    }

    pub fn passed(mut self, value: bool) -> Self {
        self.passed = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TestCaseResult`].
    /// This method will fail if any of the following fields are not set:
    /// - [`expected_result`](TestCaseResultBuilder::expected_result)
    /// - [`actual_result`](TestCaseResultBuilder::actual_result)
    /// - [`passed`](TestCaseResultBuilder::passed)
    pub fn build(self) -> Result<TestCaseResult, BuildError> {
        Ok(TestCaseResult {
            expected_result: self.expected_result.ok_or_else(|| BuildError::missing_field("expected_result"))?,
            actual_result: self.actual_result.ok_or_else(|| BuildError::missing_field("actual_result"))?,
            passed: self.passed.ok_or_else(|| BuildError::missing_field("passed"))?,
        })
    }
}
