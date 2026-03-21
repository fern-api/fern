pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TracedTestCase {
    pub result: TestCaseResultWithStdout,
    #[serde(rename = "traceResponsesSize")]
    #[serde(default)]
    pub trace_responses_size: i64,
}

impl TracedTestCase {
    pub fn builder() -> TracedTestCaseBuilder {
        TracedTestCaseBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TracedTestCaseBuilder {
    result: Option<TestCaseResultWithStdout>,
    trace_responses_size: Option<i64>,
}

impl TracedTestCaseBuilder {
    pub fn result(mut self, value: TestCaseResultWithStdout) -> Self {
        self.result = Some(value);
        self
    }

    pub fn trace_responses_size(mut self, value: i64) -> Self {
        self.trace_responses_size = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TracedTestCase`].
    /// This method will fail if any of the following fields are not set:
    /// - [`result`](TracedTestCaseBuilder::result)
    /// - [`trace_responses_size`](TracedTestCaseBuilder::trace_responses_size)
    pub fn build(self) -> Result<TracedTestCase, BuildError> {
        Ok(TracedTestCase {
            result: self.result.ok_or_else(|| BuildError::missing_field("result"))?,
            trace_responses_size: self.trace_responses_size.ok_or_else(|| BuildError::missing_field("trace_responses_size"))?,
        })
    }
}
