pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestCaseWithActualResultImplementation {
    #[serde(rename = "getActualResult")]
    pub get_actual_result: NonVoidFunctionDefinition,
    #[serde(rename = "assertCorrectnessCheck")]
    pub assert_correctness_check: AssertCorrectnessCheck,
}

impl TestCaseWithActualResultImplementation {
    pub fn builder() -> TestCaseWithActualResultImplementationBuilder {
        TestCaseWithActualResultImplementationBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TestCaseWithActualResultImplementationBuilder {
    get_actual_result: Option<NonVoidFunctionDefinition>,
    assert_correctness_check: Option<AssertCorrectnessCheck>,
}

impl TestCaseWithActualResultImplementationBuilder {
    pub fn get_actual_result(mut self, value: NonVoidFunctionDefinition) -> Self {
        self.get_actual_result = Some(value);
        self
    }

    pub fn assert_correctness_check(mut self, value: AssertCorrectnessCheck) -> Self {
        self.assert_correctness_check = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TestCaseWithActualResultImplementation`].
    /// This method will fail if any of the following fields are not set:
    /// - [`get_actual_result`](TestCaseWithActualResultImplementationBuilder::get_actual_result)
    /// - [`assert_correctness_check`](TestCaseWithActualResultImplementationBuilder::assert_correctness_check)
    pub fn build(self) -> Result<TestCaseWithActualResultImplementation, BuildError> {
        Ok(TestCaseWithActualResultImplementation {
            get_actual_result: self.get_actual_result.ok_or_else(|| BuildError::missing_field("get_actual_result"))?,
            assert_correctness_check: self.assert_correctness_check.ok_or_else(|| BuildError::missing_field("assert_correctness_check"))?,
        })
    }
}
