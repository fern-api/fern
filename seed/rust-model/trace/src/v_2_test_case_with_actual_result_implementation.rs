pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2TestCaseWithActualResultImplementation {
    #[serde(rename = "getActualResult")]
    pub get_actual_result: V2NonVoidFunctionDefinition,
    #[serde(rename = "assertCorrectnessCheck")]
    pub assert_correctness_check: V2AssertCorrectnessCheck,
}

impl V2TestCaseWithActualResultImplementation {
    pub fn builder() -> V2TestCaseWithActualResultImplementationBuilder {
        <V2TestCaseWithActualResultImplementationBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2TestCaseWithActualResultImplementationBuilder {
    get_actual_result: Option<V2NonVoidFunctionDefinition>,
    assert_correctness_check: Option<V2AssertCorrectnessCheck>,
}

impl V2TestCaseWithActualResultImplementationBuilder {
    pub fn get_actual_result(mut self, value: V2NonVoidFunctionDefinition) -> Self {
        self.get_actual_result = Some(value);
        self
    }

    pub fn assert_correctness_check(mut self, value: V2AssertCorrectnessCheck) -> Self {
        self.assert_correctness_check = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2TestCaseWithActualResultImplementation`].
    /// This method will fail if any of the following fields are not set:
    /// - [`get_actual_result`](V2TestCaseWithActualResultImplementationBuilder::get_actual_result)
    /// - [`assert_correctness_check`](V2TestCaseWithActualResultImplementationBuilder::assert_correctness_check)
    pub fn build(self) -> Result<V2TestCaseWithActualResultImplementation, BuildError> {
        Ok(V2TestCaseWithActualResultImplementation {
            get_actual_result: self.get_actual_result.ok_or_else(|| BuildError::missing_field("get_actual_result"))?,
            assert_correctness_check: self.assert_correctness_check.ok_or_else(|| BuildError::missing_field("assert_correctness_check"))?,
        })
    }
}
