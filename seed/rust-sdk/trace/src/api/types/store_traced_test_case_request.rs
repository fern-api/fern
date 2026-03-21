pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct StoreTracedTestCaseRequest {
    pub result: TestCaseResultWithStdout,
    #[serde(rename = "traceResponses")]
    #[serde(default)]
    pub trace_responses: Vec<TraceResponse>,
}

impl StoreTracedTestCaseRequest {
    pub fn builder() -> StoreTracedTestCaseRequestBuilder {
        StoreTracedTestCaseRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct StoreTracedTestCaseRequestBuilder {
    result: Option<TestCaseResultWithStdout>,
    trace_responses: Option<Vec<TraceResponse>>,
}

impl StoreTracedTestCaseRequestBuilder {
    pub fn result(mut self, value: TestCaseResultWithStdout) -> Self {
        self.result = Some(value);
        self
    }

    pub fn trace_responses(mut self, value: Vec<TraceResponse>) -> Self {
        self.trace_responses = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`StoreTracedTestCaseRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`result`](StoreTracedTestCaseRequestBuilder::result)
    /// - [`trace_responses`](StoreTracedTestCaseRequestBuilder::trace_responses)
    pub fn build(self) -> Result<StoreTracedTestCaseRequest, BuildError> {
        Ok(StoreTracedTestCaseRequest {
            result: self.result.ok_or_else(|| BuildError::missing_field("result"))?,
            trace_responses: self.trace_responses.ok_or_else(|| BuildError::missing_field("trace_responses"))?,
        })
    }
}

