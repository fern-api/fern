pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestCaseResultWithStdout {
    pub result: TestCaseResult,
    #[serde(default)]
    pub stdout: String,
}

impl TestCaseResultWithStdout {
    pub fn builder() -> TestCaseResultWithStdoutBuilder {
        TestCaseResultWithStdoutBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TestCaseResultWithStdoutBuilder {
    result: Option<TestCaseResult>,
    stdout: Option<String>,
}

impl TestCaseResultWithStdoutBuilder {
    pub fn result(mut self, value: TestCaseResult) -> Self {
        self.result = Some(value);
        self
    }

    pub fn stdout(mut self, value: impl Into<String>) -> Self {
        self.stdout = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`TestCaseResultWithStdout`].
    /// This method will fail if any of the following fields are not set:
    /// - [`result`](TestCaseResultWithStdoutBuilder::result)
    /// - [`stdout`](TestCaseResultWithStdoutBuilder::stdout)
    pub fn build(self) -> Result<TestCaseResultWithStdout, BuildError> {
        Ok(TestCaseResultWithStdout {
            result: self.result.ok_or_else(|| BuildError::missing_field("result"))?,
            stdout: self.stdout.ok_or_else(|| BuildError::missing_field("stdout"))?,
        })
    }
}
