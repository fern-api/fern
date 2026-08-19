pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct TestCaseExpects2 {
    #[serde(rename = "expectedStdout")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expected_stdout: Option<String>,
}

impl TestCaseExpects2 {
    pub fn builder() -> TestCaseExpects2Builder {
        <TestCaseExpects2Builder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TestCaseExpects2Builder {
    expected_stdout: Option<String>,
}

impl TestCaseExpects2Builder {
    pub fn expected_stdout(mut self, value: impl Into<String>) -> Self {
        self.expected_stdout = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`TestCaseExpects2`].
    pub fn build(self) -> Result<TestCaseExpects2, BuildError> {
        Ok(TestCaseExpects2 {
            expected_stdout: self.expected_stdout,
        })
    }
}
