pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestCaseWithExpectedResult {
    #[serde(rename = "testCase")]
    #[serde(default)]
    pub test_case: TestCase,
    #[serde(rename = "expectedResult")]
    pub expected_result: VariableValue,
}

impl TestCaseWithExpectedResult {
    pub fn builder() -> TestCaseWithExpectedResultBuilder {
        TestCaseWithExpectedResultBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TestCaseWithExpectedResultBuilder {
    test_case: Option<TestCase>,
    expected_result: Option<VariableValue>,
}

impl TestCaseWithExpectedResultBuilder {
    pub fn test_case(mut self, value: TestCase) -> Self {
        self.test_case = Some(value);
        self
    }

    pub fn expected_result(mut self, value: VariableValue) -> Self {
        self.expected_result = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TestCaseWithExpectedResult`].
    /// This method will fail if any of the following fields are not set:
    /// - [`test_case`](TestCaseWithExpectedResultBuilder::test_case)
    /// - [`expected_result`](TestCaseWithExpectedResultBuilder::expected_result)
    pub fn build(self) -> Result<TestCaseWithExpectedResult, BuildError> {
        Ok(TestCaseWithExpectedResult {
            test_case: self.test_case.ok_or_else(|| BuildError::missing_field("test_case"))?,
            expected_result: self.expected_result.ok_or_else(|| BuildError::missing_field("expected_result"))?,
        })
    }
}
