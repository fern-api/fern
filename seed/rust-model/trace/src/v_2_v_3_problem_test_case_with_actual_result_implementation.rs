pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestCaseWithActualResultImplementation2 {
    #[serde(rename = "getActualResult")]
    pub get_actual_result: NonVoidFunctionDefinition2,
    #[serde(rename = "assertCorrectnessCheck")]
    pub assert_correctness_check: AssertCorrectnessCheck2,
}

impl TestCaseWithActualResultImplementation2 {
    pub fn builder() -> TestCaseWithActualResultImplementation2Builder {
        TestCaseWithActualResultImplementation2Builder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TestCaseWithActualResultImplementation2Builder {
    get_actual_result: Option<NonVoidFunctionDefinition2>,
    assert_correctness_check: Option<AssertCorrectnessCheck2>,
}

impl TestCaseWithActualResultImplementation2Builder {
    pub fn get_actual_result(mut self, value: NonVoidFunctionDefinition2) -> Self {
        self.get_actual_result = Some(value);
        self
    }

    pub fn assert_correctness_check(mut self, value: AssertCorrectnessCheck2) -> Self {
        self.assert_correctness_check = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TestCaseWithActualResultImplementation2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`get_actual_result`](TestCaseWithActualResultImplementation2Builder::get_actual_result)
    /// - [`assert_correctness_check`](TestCaseWithActualResultImplementation2Builder::assert_correctness_check)
    pub fn build(self) -> Result<TestCaseWithActualResultImplementation2, BuildError> {
        Ok(TestCaseWithActualResultImplementation2 {
            get_actual_result: self.get_actual_result.ok_or_else(|| BuildError::missing_field("get_actual_result"))?,
            assert_correctness_check: self.assert_correctness_check.ok_or_else(|| BuildError::missing_field("assert_correctness_check"))?,
        })
    }
}
