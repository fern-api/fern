pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct TestCaseExpects {
    #[serde(rename = "expectedStdout")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expected_stdout: Option<String>,
}

impl TestCaseExpects {
    pub fn builder() -> TestCaseExpectsBuilder {
        <TestCaseExpectsBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TestCaseExpectsBuilder {
    expected_stdout: Option<String>,
}

impl TestCaseExpectsBuilder {
    pub fn expected_stdout(mut self, value: impl Into<String>) -> Self {
        self.expected_stdout = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`TestCaseExpects`].
    pub fn build(self) -> Result<TestCaseExpects, BuildError> {
        Ok(TestCaseExpects {
            expected_stdout: self.expected_stdout,
        })
    }
}
