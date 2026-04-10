pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2V3TestCaseWithActualResultImplementation {
    #[serde(rename = "getActualResult")]
    pub get_actual_result: V2V3NonVoidFunctionDefinition,
    #[serde(rename = "assertCorrectnessCheck")]
    pub assert_correctness_check: V2V3AssertCorrectnessCheck,
}

impl V2V3TestCaseWithActualResultImplementation {
    pub fn builder() -> V2V3TestCaseWithActualResultImplementationBuilder {
        <V2V3TestCaseWithActualResultImplementationBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2V3TestCaseWithActualResultImplementationBuilder {
    get_actual_result: Option<V2V3NonVoidFunctionDefinition>,
    assert_correctness_check: Option<V2V3AssertCorrectnessCheck>,
}

impl V2V3TestCaseWithActualResultImplementationBuilder {
    pub fn get_actual_result(mut self, value: V2V3NonVoidFunctionDefinition) -> Self {
        self.get_actual_result = Some(value);
        self
    }

    pub fn assert_correctness_check(mut self, value: V2V3AssertCorrectnessCheck) -> Self {
        self.assert_correctness_check = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2V3TestCaseWithActualResultImplementation`].
    /// This method will fail if any of the following fields are not set:
    /// - [`get_actual_result`](V2V3TestCaseWithActualResultImplementationBuilder::get_actual_result)
    /// - [`assert_correctness_check`](V2V3TestCaseWithActualResultImplementationBuilder::assert_correctness_check)
    pub fn build(self) -> Result<V2V3TestCaseWithActualResultImplementation, BuildError> {
        Ok(V2V3TestCaseWithActualResultImplementation {
            get_actual_result: self.get_actual_result.ok_or_else(|| BuildError::missing_field("get_actual_result"))?,
            assert_correctness_check: self.assert_correctness_check.ok_or_else(|| BuildError::missing_field("assert_correctness_check"))?,
        })
    }
}
